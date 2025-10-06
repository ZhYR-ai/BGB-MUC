import React from 'react';

interface LocationAutocompleteInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
  options?: string[];
}

const maxSuggestions = 6;

const LocationAutocompleteInput = React.forwardRef<HTMLInputElement, LocationAutocompleteInputProps>(
  ({ value, onChange, onBlur, placeholder, disabled, className, options = [], ...rest }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);
    const containerRef = React.useRef<HTMLDivElement | null>(null);
    const inputRef = React.useRef<HTMLInputElement | null>(null);

    React.useEffect(() => {
      const handleClickAway = (event: MouseEvent) => {
        if (!containerRef.current) return;
        if (containerRef.current.contains(event.target as Node)) return;
        setIsFocused(false);
      };

      document.addEventListener('mousedown', handleClickAway);
      return () => document.removeEventListener('mousedown', handleClickAway);
    }, []);

    const filteredSuggestions = React.useMemo(() => {
      if (!options.length) return [];
      if (!value) return options.slice(0, maxSuggestions);

      const lower = value.toLowerCase();
      return options
        .filter((option) => option.toLowerCase().includes(lower))
        .slice(0, maxSuggestions);
    }, [options, value]);

    const mergedClassName = className ?? 'input-field mt-1';

    const assignRef = (node: HTMLInputElement | null) => {
      inputRef.current = node;
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        (ref as React.MutableRefObject<HTMLInputElement | null>).current = node;
      }
    };

    const handleSelect = (suggestion: string) => {
      onChange(suggestion);
      setIsFocused(false);
      inputRef.current?.focus();
    };

    return (
      <div className="relative" ref={containerRef}>
        <input
          {...rest}
          ref={assignRef}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur}
          onFocus={() => setIsFocused(true)}
          placeholder={placeholder}
          disabled={disabled}
          className={mergedClassName}
          autoComplete="off"
        />

        {isFocused && filteredSuggestions.length > 0 && (
          <div className="absolute z-10 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg">
            <ul className="max-h-60 overflow-y-auto py-1 text-sm text-gray-700">
              {filteredSuggestions.map((suggestion) => (
                <li key={suggestion}>
                  <button
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => handleSelect(suggestion)}
                    className="w-full px-3 py-2 text-left hover:bg-gray-100"
                  >
                    {suggestion}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }
);

LocationAutocompleteInput.displayName = 'LocationAutocompleteInput';

export default LocationAutocompleteInput;
