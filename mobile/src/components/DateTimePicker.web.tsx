import React, { ChangeEvent, useRef, useEffect } from 'react';

interface Props {
  value: Date;
  onChange: (event: any, date?: Date) => void;
  mode?: 'date' | 'time' | 'datetime';
}

export default function DateTimePicker({ value, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Open the date picker automatically when rendered
    if (inputRef.current) {
      // @ts-ignore - showPicker is a valid method on input type="date" in modern browsers
      if (typeof inputRef.current.showPicker === 'function') {
        inputRef.current.showPicker();
      } else {
        inputRef.current.focus();
      }
    }
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.value) return;
    // The date input returns YYYY-MM-DD
    // Create date and adjust for local timezone to prevent off-by-one day errors
    const [year, month, day] = e.target.value.split('-');
    const selectedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    onChange({}, selectedDate);
  };

  // format Date to YYYY-MM-DD for input value
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  const dateStr = `${year}-${month}-${day}`;

  return (
    <div style={{ position: 'absolute', top: 40, left: 0, zIndex: 999 }}>
      <input
        ref={inputRef}
        type="date"
        value={dateStr}
        onChange={handleChange}
        onBlur={() => {
           // Provide a way to close it without changing date if they click away
           onChange({}, undefined); 
        }}
        style={{
          padding: '8px 12px',
          borderRadius: '8px',
          border: '1px solid #CBD5E1',
          fontSize: '14px',
          fontFamily: 'inherit',
          backgroundColor: '#fff',
          color: '#0F172A',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
          outline: 'none',
          cursor: 'pointer',
        }}
      />
    </div>
  );
}
