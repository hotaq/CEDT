"use client";

import dayjs, { Dayjs } from "dayjs";
import { useState } from "react";

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

const DateReserve = () => {
  const [value, setValue] = useState<Dayjs | null>(dayjs());

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        label="Event Date"
        value={value}
        onChange={(newValue) => setValue(newValue)}
        slotProps={{
          textField: {
            variant: "standard",
            fullWidth: true,
          },
        }}
      />
    </LocalizationProvider>
  );
};

export default DateReserve;
