"use client";

import { type ChangeEvent, type FormEvent, useState } from "react";
import dayjs, { type Dayjs } from "dayjs";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import type { SelectChangeEvent } from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useDispatch } from "react-redux";
import DateReserve from "@/components/DateReserve";
import { addBooking } from "@/redux/features/bookSlice";
import type { AppDispatch } from "@/redux/store";

export default function BookingPage() {
  const dispatch = useDispatch<AppDispatch>();
  const [bookingInfo, setBookingInfo] = useState({
    "Name-Lastname": "",
    "Contact-Number": "",
    venue: "",
  });
  const [bookDate, setBookDate] = useState<Dayjs | null>(dayjs());

  const handleTextChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    setBookingInfo((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleVenueChange = (event: SelectChangeEvent) => {
    setBookingInfo((current) => ({
      ...current,
      venue: event.target.value,
    }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (
      !bookingInfo["Name-Lastname"].trim() ||
      !bookingInfo["Contact-Number"].trim() ||
      !bookingInfo.venue ||
      !bookDate
    ) {
      return;
    }

    dispatch(
      addBooking({
        nameLastname: bookingInfo["Name-Lastname"].trim(),
        tel: bookingInfo["Contact-Number"].trim(),
        venue: bookingInfo.venue,
        bookDate: bookDate.format("YYYY/MM/DD"),
      })
    );

    setBookingInfo({
      "Name-Lastname": "",
      "Contact-Number": "",
      venue: "",
    });
    setBookDate(dayjs());
  };

  return (
    <Box className="mx-auto max-w-5xl space-y-8 px-6 py-10">
      <Box>
        <Typography component="h1" variant="h4" gutterBottom>
          Venue Booking
        </Typography>
        <Typography color="textSecondary">
          Fill in the form below to book a venue and save the booking in Redux.
        </Typography>
      </Box>

      <Box component="form" onSubmit={handleSubmit}>
        <Stack spacing={3}>
          <TextField
            label="Name-Lastname"
            name="Name-Lastname"
            variant="standard"
            value={bookingInfo["Name-Lastname"]}
            onChange={handleTextChange}
            required
          />
          <TextField
            label="Contact-Number"
            name="Contact-Number"
            variant="standard"
            value={bookingInfo["Contact-Number"]}
            onChange={handleTextChange}
            required
          />
          <FormControl variant="standard" fullWidth required>
            <InputLabel id="venue-label">Venue</InputLabel>
            <Select
              id="venue"
              name="venue"
              labelId="venue-label"
              value={bookingInfo.venue}
              onChange={handleVenueChange}
            >
              <MenuItem value="Bloom">The Bloom Pavilion</MenuItem>
              <MenuItem value="Spark">Spark Space</MenuItem>
              <MenuItem value="GrandTable">The Grand Table</MenuItem>
            </Select>
          </FormControl>
          <DateReserve value={bookDate} onChange={setBookDate} />
          <Button type="submit" name="Book Venue" variant="contained">
            Book Venue
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}
