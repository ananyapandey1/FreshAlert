import express from 'express';
import cors from 'cors';
import { GoogleGenAI } from '@google/genai';
import { google } from 'googleapis';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from './database.js';

dotenv.config();

const app = express();
const port = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretfreshalertkey';

// Set up Google OAuth2 client
const oauth2Client = new google.auth.OAuth2(
  process.env.OAUTH_CLIENT_ID || 'UNCONFIGURED_CLIENT_ID',
  process.env.OAUTH_CLIENT_SECRET || 'UNCONFIGURED_CLIENT_SECRET',
  process.env.OAUTH_REDIRECT_URI || 'http://localhost:3000/api/auth/callback'
);

// Google tokens are now stored in the Users table per user.

// Increase limit to handle base64 image strings
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Auth Middleware
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) return res.status(403).json({ error: "Invalid token" });
      req.user = user;
      next();
    });
  } else {
    res.status(401).json({ error: "Authorization header required" });
  }
};

// ---------------- AUTH ROUTES ----------------

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password required" });
    
    const hash = bcrypt.hashSync(password, 8);
    
    try {
      const resDb = await db.query(
        'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id',
        [email, hash]
      );
      const user = { id: resDb.rows[0].id, email };
      const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
      res.json({ token, user });
    } catch (err) {
      if (err.code === '23505') { // Postgres UNIQUE constraint violation
        return res.status(400).json({ error: "Email already exists" });
      }
      throw err;
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const resDb = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    const userRecord = resDb.rows[0];
    
    if (!userRecord) {
      return res.status(401).json({ error: "Looks like you are still not part of the fam! Sign up first." });
    }
    
    if (!bcrypt.compareSync(password, userRecord.password_hash)) {
      return res.status(401).json({ error: "Invalid password" });
    }
    
    const user = { id: userRecord.id, email: userRecord.email };
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ---------------- INVENTORY ROUTES ----------------

app.get('/api/inventory', authenticate, async (req, res) => {
  try {
    const userId = parseInt(req.user.id);
    console.log(`Fetching inventory for User ID: ${userId}`);
    const resDb = await db.query('SELECT * FROM inventory WHERE user_id = $1 ORDER BY id DESC', [userId]);
    console.log(`Found ${resDb.rows.length} items for User ${userId}`);
    res.json(resDb.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ---------------- GOOGLE OAUTH ROUTES ----------------

app.get('/api/auth/status', authenticate, async (req, res) => {
  try {
    const resDb = await db.query('SELECT google_tokens FROM users WHERE id = $1', [req.user.id]);
    const user = resDb.rows[0];
    res.json({ authorized: !!(user && user.google_tokens) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/auth/google', (req, res) => {
  const { userId } = req.query;
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: ['https://www.googleapis.com/auth/calendar.events'],
    state: userId
  });
  res.redirect(url);
});

app.get('/api/auth/callback', async (req, res) => {
  const { code, state } = req.query;
  console.log("OAuth Callback Hit, receiving code");
  
  try {
    const { tokens } = await oauth2Client.getToken(code);
    const userId = parseInt(state); 
    
    if (userId) {
      console.log(`OAuth tokens received for User ${userId}. Updating user record...`);
      await db.query('UPDATE users SET google_tokens = $1 WHERE id = $2', [JSON.stringify(tokens), userId]);
      console.log("OAuth Token Successfully Stored in DB for user:", userId);
    }
    
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    res.redirect(`${clientUrl}?auth=success`);
  } catch (error) {
    console.error('Error retrieving access token', error);
    res.status(500).send('Authentication failed');
  }
});

app.post('/api/inventory', authenticate, async (req, res) => {
  try {
    const { product_name, expiry_date, product_image, status, calendar_id } = req.body;
    let finalCalendarId = calendar_id || 'unlinked';

    console.log(`User ${req.user.id} is adding product: ${product_name}`);
    const resUser = await db.query('SELECT google_tokens FROM users WHERE id = $1', [req.user.id]);
    const userRecord = resUser.rows[0];
    const userTokens = userRecord && userRecord.google_tokens ? JSON.parse(userRecord.google_tokens) : null;

    if (userTokens && expiry_date) {
      console.log(`Calendar tokens found for user ${req.user.id}. Attempting sync.`);
      oauth2Client.setCredentials(userTokens);
      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
      
      const [yyyy, mm, dd] = expiry_date.split('-');
      const startDate = new Date(Date.UTC(yyyy, parseInt(mm) - 1, dd));
      const endDate = new Date(Date.UTC(yyyy, parseInt(mm) - 1, parseInt(dd) + 1));
      const warningStartDate = new Date(Date.UTC(yyyy, parseInt(mm) - 1, parseInt(dd) - 7));
      const warningEndDate = new Date(Date.UTC(yyyy, parseInt(mm) - 1, parseInt(dd) - 6));
      
      const expiryStartStr = startDate.toISOString().split('T')[0];
      const expiryEndStr = endDate.toISOString().split('T')[0];
      const warningStartStr = warningStartDate.toISOString().split('T')[0];
      const warningEndStr = warningEndDate.toISOString().split('T')[0];

      const expiryEvent = {
        summary: `🚨 EXPIRING TODAY: ${product_name}`,
        description: `Your ${product_name} in FreshAlert is expiring today!`,
        start: { date: expiryStartStr },
        end: { date: expiryEndStr },
        reminders: { useDefault: true },
        colorId: "11"
      };

      const warningEvent = {
        summary: `🕒 7-DAY WARNING: ${product_name} Expires Soon`,
        description: `Your ${product_name} will expire in 7 days! Plan your meals now.`,
        start: { date: warningStartStr },
        end: { date: warningEndStr },
        reminders: { useDefault: true },
        colorId: "5"
      };

      try {
        const calRes = await calendar.events.insert({ calendarId: 'primary', resource: expiryEvent });
        await calendar.events.insert({ calendarId: 'primary', resource: warningEvent });
        finalCalendarId = calRes.data.id;
        console.log(`Successfully created BOTH events for ${product_name}`);
      } catch (calError) {
        console.error('Calendar Insert Error:', calError.message);
      }
    }

    const userId = parseInt(req.user.id);
    await db.query(`
      INSERT INTO inventory (product_name, expiry_date, product_image, status, calendar_id, added_on, user_id)
      VALUES ($1, $2, $3, $4, $5, CURRENT_DATE, $6)
    `, [product_name, expiry_date, product_image, status, finalCalendarId, userId]);
    console.log(`Successfully saved item to DB for User ${userId}`);
    
    res.status(201).json({ 
      message: "Success",
      syncedToCalendar: !!(userTokens && finalCalendarId !== 'unlinked') 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/inventory/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { product_name, expiry_date, added_on, status } = req.body;
    
    const resDb = await db.query(`
      UPDATE inventory 
      SET product_name = $1, expiry_date = $2, added_on = $3, status = $4
      WHERE id = $5 AND user_id = $6
    `, [product_name, expiry_date, added_on, status, id, req.user.id]);
    
    if (resDb.rowCount === 0) return res.status(404).json({ error: "Item not found" });
    
    res.json({ message: "Updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/inventory/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const resDb = await db.query('DELETE FROM inventory WHERE id = $1 AND user_id = $2', [id, req.user.id]);
    if (resDb.rowCount === 0) return res.status(404).json({ error: "Item not found" });
    
    res.json({ message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/analyze-image', async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) return res.status(400).json({ error: "Missing image" });

    // Initialize Gemini API
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    // Convert base64 Data URIs to clean Base64 strings for Gemini
    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");

    const prompt = `Identify the food product name and its expiry date from this image. If the expiry is written as a relative duration (e.g., '60 days from manufacturing date' or 'X months from mfg'), explicitly locate the manufacturing date (Mfg Date) on the package and calculate the final expiry date from that manufacturing date. If no manufacturing date is found, calculate the final date based on today (March 24, 2026). Return strictly as JSON: {"product_name": "string", "expiry_date": "DD/MM/YYYY"}.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        prompt,
        {
          inlineData: {
            data: base64Data,
            mimeType: 'image/jpeg'
          }
        }
      ],
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text;
    
    // Parse the JSON text
    let parsedData = { product_name: "Unknown Product", expiry_date: "" };
    try {
       parsedData = JSON.parse(text.trim().replace(/^```json/, '').replace(/```$/, ''));
    } catch (e) {
       console.error("Failed to parse Gemini JSON", e, text);
    }

    const name = parsedData.product_name || "Unknown Product";
    let expiry = parsedData.expiry_date || "";

    // Convert DD/MM/YYYY or YYYY-MM-DD to YYYY-MM-DD for the HTML5 date input type
    if (expiry.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
      const [dd, mm, yyyy] = expiry.split('/');
      expiry = `${yyyy}-${mm}-${dd}`;
    }

    res.json({ name, expiry });
  } catch (error) {
    console.error("Gemini Error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
