"use client";

import dayjs, { type Dayjs } from "dayjs";
import { useState } from "react";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";

type DateReserveProps = {
  value?: Dayjs | null;
  onChange?: (newValue: Dayjs | null) => void;
};

export default function DateReserve({
  value,
  onChange,
}: Readonly<DateReserveProps>) {
  const [internalValue, setInternalValue] = useState<Dayjs | null>(dayjs());
  const resolvedValue = value === undefined ? internalValue : value;

  const handleChange = (newValue: Dayjs | null) => {
    if (value === undefined) {
      setInternalValue(newValue);
    }

    onChange?.(newValue);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        label="Event Date"
        value={resolvedValue}
        onChange={handleChange}
        slotProps={{
          textField: {
            variant: "standard",
            fullWidth: true,
          },
        }}
      />
    </LocalizationProvider>
  );
}
