import '@testing-library/jest-dom'
import { screen, render } from '@testing-library/react'
import Page from '@/app/(venueinfo)/venue/[vid]/page'

describe('venue id route section page', () => {
  it('Page contains Banner and CardPanel', async () => {
    const element = await Page({
      params: Promise.resolve({ vid: '001' }),
    })
    render(element)

    const venueImage = screen.getByRole("img")
    expect(venueImage).toBeInTheDocument 
    expect(screen.getByText(/Bloom/i)).toBeInTheDocument 
  })
})
