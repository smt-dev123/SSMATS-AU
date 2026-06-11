import RNDateTimePicker from '@react-native-community/datetimepicker';
import React from 'react';

interface Props {
  value: Date;
  onChange: (event: any, date?: Date) => void;
  mode?: 'date' | 'time' | 'datetime';
  display?: 'default' | 'spinner' | 'calendar' | 'clock';
}

export default function DateTimePicker({ value, onChange, mode = 'date', display = 'default' }: Props) {
  return (
    <RNDateTimePicker
      value={value}
      mode={mode}
      display={display}
      onChange={onChange}
    />
  );
}
