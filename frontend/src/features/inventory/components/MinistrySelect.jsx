import { useEffect, useRef, useState } from 'react';
import { HiCheck, HiChevronDown } from 'react-icons/hi';
import clsx from 'clsx';

export const MinistrySelect = ({
  value,
  options = [],
  placeholder = 'Select a ministry',
  onChange,
  disabled = false,
}) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (option) => {
    onChange?.(option);
    setOpen(false);
  };

  const toggle = () => {
    if (disabled) return;
    setOpen((prev) => !prev);
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={toggle}
        disabled={disabled}
        className={clsx(
          'flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-[color:var(--sbcc-primary)]',
          disabled
            ? 'cursor-not-allowed bg-sbcc-cream text-sbcc-gray border-sbcc-gray/30'
            : 'border-sbcc-gray/30 bg-white text-sbcc-dark hover:border-sbcc-dark'
        )}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={clsx(!value && 'text-sbcc-gray')}>{value || placeholder}</span>
        <HiChevronDown className="h-5 w-5 text-sbcc-gray" />
      </button>

      {open && (
        <div className="absolute z-40 mt-2 w-full rounded-2xl border border-sbcc-gray/20 bg-white shadow-[0_24px_60px_rgba(31,41,55,0.12)]">
          <div className="max-h-[21rem] overflow-y-auto">
            {options.length ? (
              options.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={clsx(
                    'flex w-full items-center justify-between px-4 py-3 text-sm transition',
                    value === option
                      ? 'bg-sbcc-light-orange/70 text-sbcc-dark font-semibold'
                      : 'hover:bg-sbcc-cream text-sbcc-dark'
                  )}
                  onClick={() => handleSelect(option)}
                >
                  <span>{option}</span>
                  {value === option && <HiCheck className="h-4 w-4" />}
                </button>
              ))
            ) : (
              <div className="px-4 py-3 text-sm text-sbcc-gray">
                No ministries configured yet.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MinistrySelect;
