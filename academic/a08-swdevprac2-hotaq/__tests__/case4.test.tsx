import '@testing-library/jest-dom'
import { screen, render, waitFor } from '@testing-library/react'
import Page from '@/app/(venueinfo)/venue/[vid]/page'

describe('venue detail page', () => {
  it('Page contains venue details', async () => {
    const detailPage = await Page({params: {vid: '67d044e0c0062950a985c509'}})
    render(detailPage)
    await waitFor(()=> {
      const venueName = screen.queryAllByText(/The Bloom Pavilion/i)
      expect(venueName.length).toBeGreaterThan(0)
      const venueTel = screen.queryAllByText(/024435595/i)
      expect(venueTel.length).toBeGreaterThan(0)
    })  
  })
})