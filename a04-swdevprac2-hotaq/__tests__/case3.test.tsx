import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import TopMenu from '@/components/TopMenu'
import BookingPage from '@/app/booking/page'

describe('TopMenu', () => {
  it('TopMenu contains image and booking link', () => {
    render(<TopMenu />)
    const logos = screen.queryAllByRole('img')
    expect(logos).toHaveLength(1)
    const links = screen.queryAllByRole('link')
    expect(links.length).toBeGreaterThanOrEqual(1)
    const bookingLink = links.find((link) =>
      (link as HTMLLinkElement).href.includes('/booking')
    )
    expect(bookingLink).toBeDefined()
  })
})

describe('Booking Page', () => {
  it('Booking Page Exist', () => {
    const title = 'Venue Booking'
    render(<BookingPage />)
    const titleText = screen.getByText(new RegExp(title, 'i'))
    expect(titleText).toBeInTheDocument()
  })
})
