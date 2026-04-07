"use client";

import { ChangeEvent, FormEvent, useState } from "react";

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

import DateReserve from "@/components/DateReserve";

export default function BookingPage() {
  const [bookingInfo, setBookingInfo] = useState({
    "Name-Lastname": "",
    "Contact-Number": "",
    venue: "",
  });

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
  };

  return (
    <Box className="mx-auto max-w-2xl px-6 py-10">
      <Typography component="h1" variant="h4" gutterBottom>
        Venue Booking
      </Typography>
      <Box component="form" onSubmit={handleSubmit}>
        <Stack spacing={3}>
          <TextField
            label="Name-Lastname"
            name="Name-Lastname"
            variant="standard"
            value={bookingInfo["Name-Lastname"]}
            onChange={handleTextChange}
          />
          <TextField
            label="Contact-Number"
            name="Contact-Number"
            variant="standard"
            value={bookingInfo["Contact-Number"]}
            onChange={handleTextChange}
          />
          <FormControl variant="standard" fullWidth>
            <InputLabel id="venue-label">Venue</InputLabel>
            <Select
              id="venue"
              labelId="venue-label"
              value={bookingInfo.venue}
              onChange={handleVenueChange}
            >
              <MenuItem value="Bloom">The Bloom Pavilion</MenuItem>
              <MenuItem value="Spark">Spark Space</MenuItem>
              <MenuItem value="GrandTable">The Grand Table</MenuItem>
            </Select>
          </FormControl>
          <DateReserve />
          <Button type="submit" name="Book Venue" variant="contained">
            Book Venue
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}
