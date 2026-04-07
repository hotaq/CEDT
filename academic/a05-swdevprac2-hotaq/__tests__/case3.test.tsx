import '@testing-library/jest-dom'
import { render, screen, within } from '@testing-library/react'
import BookingPage from '@/app/booking/page'
import { userEvent } from "@testing-library/user-event";


describe('Booking Page', () => {
  it('Booking Page contains Form', async() => {
    render(<BookingPage/>)
    
    const nameLastname = screen.getByRole('textbox', { name: /Name-Lastname/i })
    expect(nameLastname).toBeInTheDocument
    expect(nameLastname.classList).toContain('MuiInput-input')
    
    const contactNo = screen.getByRole('textbox', { name: /Contact-Number/i })
    expect(contactNo).toBeInTheDocument
    expect(contactNo.classList).toContain('MuiInput-input')    

    const venueSelect = screen.getByRole('combobox')
    expect(venueSelect).toBeInTheDocument
    expect(venueSelect.className).toContain('MuiSelect-select')

    const bookBtn = screen.getByRole('button', {name: /Book Venue/i})
    expect(bookBtn).toBeInTheDocument

    await userEvent.click(venueSelect);
    expect(
      await screen.findByRole("option", {name: /The Bloom Pavilion/i})
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("option", {name: /Spark Space/i})
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("option", {name: /The Grand Table/i})
    ).toBeInTheDocument();  
    
  })
})