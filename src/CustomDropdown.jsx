import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

/**
 * CustomDropdown Component
 * 
 * A senior-grade custom select / dropdown control designed with:
 * - Pixel-perfect alignment and height matching
 * - Micro-interactions (chevron rotation, smooth popover scale & fade)
 * - Rich option items with icons, titles, descriptions, and active checkmarks
 * - Full accessibility (ARIA listbox, keyboard navigation, outside click dismiss)
 */
const CustomDropdown = ({
  value,
  onChange,
  options = [],
  prefix = '',
  icon: TriggerIcon = null,
  align = 'right',
  size = 'medium', // 'medium' (48px for topbar) | 'compact' (38px for settings)
  className = '',
  ariaLabel = 'Select option'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef(null);
  const listboxRef = useRef(null);

  // Find currently selected option
  const selectedOption = options.find(opt => opt.value === value) || options[0];

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('touchstart', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        setIsOpen(true);
        const currentIndex = options.findIndex(opt => opt.value === value);
        setHighlightedIndex(currentIndex >= 0 ? currentIndex : 0);
      }
      return;
    }

    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        break;
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => (prev + 1) % options.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => (prev - 1 + options.length) % options.length);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < options.length) {
          onChange(options[highlightedIndex].value);
          setIsOpen(false);
        }
        break;
      case 'Tab':
        setIsOpen(false);
        break;
      default:
        break;
    }
  };

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div 
      className={`custom-dropdown-container ${size} ${className}`} 
      ref={dropdownRef}
      onKeyDown={handleKeyDown}
    >
      <button
        type="button"
        className={`custom-dropdown-trigger ${isOpen ? 'is-open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel}
      >
        <div className="custom-dropdown-trigger-left">
          {TriggerIcon && (
            <span className="custom-dropdown-icon">
              <TriggerIcon size={16} />
            </span>
          )}
          <span className="custom-dropdown-label">
            {prefix && <span className="custom-dropdown-prefix">{prefix} </span>}
            <span className="custom-dropdown-value">{selectedOption?.shortLabel || selectedOption?.label}</span>
          </span>
        </div>
        <ChevronDown 
          size={16} 
          className={`custom-dropdown-chevron ${isOpen ? 'rotate' : ''}`} 
        />
      </button>

      {isOpen && (
        <div 
          className={`custom-dropdown-popover align-${align}`}
          role="listbox"
          ref={listboxRef}
          aria-label={ariaLabel}
        >
          {options.map((option, index) => {
            const isSelected = option.value === value;
            const isHighlighted = index === highlightedIndex;
            const OptionIcon = option.icon;

            return (
              <div
                key={option.value}
                role="option"
                aria-selected={isSelected}
                className={`custom-dropdown-item ${isSelected ? 'selected' : ''} ${isHighlighted ? 'highlighted' : ''}`}
                onClick={() => handleSelect(option.value)}
                onMouseEnter={() => setHighlightedIndex(index)}
              >
                <div className="custom-dropdown-item-left">
                  {OptionIcon && (
                    <div className="custom-dropdown-item-icon">
                      <OptionIcon size={16} />
                    </div>
                  )}
                  <div className="custom-dropdown-item-text">
                    <div className="custom-dropdown-item-title">{option.label}</div>
                    {option.subtitle && (
                      <div className="custom-dropdown-item-desc">{option.subtitle}</div>
                    )}
                  </div>
                </div>

                {isSelected && (
                  <div className="custom-dropdown-item-check">
                    <Check size={16} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CustomDropdown;
