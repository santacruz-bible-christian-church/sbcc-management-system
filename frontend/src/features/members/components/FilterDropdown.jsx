import { useState, useRef, useEffect } from 'react';
import { HiChevronDown } from 'react-icons/hi';

export const FilterDropdown = ({
  label,
  value,
  options = [],
  onChange,
  displayValue,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-sbcc-gray border rounded-full bg-white text-sm px-3 py-2 text-center flex justify-between items-center hover:bg-gray-50 transition-colors"
      >
        <span className="truncate">{displayValue || label}</span>
        <HiChevronDown
          className={`w-4 h-4 ml-2 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-200">
          <ul className="py-2 text-sm text-gray-700 max-h-60 overflow-y-auto">
            {options.map((option, index) => (
              <li key={option.value ?? index}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors"
                >
                  {option.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
