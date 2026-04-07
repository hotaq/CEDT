import '@testing-library/jest-dom'
import { render, waitFor } from '@testing-library/react'
import Page from '@/app/(venueinfo)/venue/page'
import VenueCatalog from '@/components/VenueCatalog'

jest.mock('../src/components/VenueCatalog')

describe('venue page', () => {
  it('Page contains VenueCatalog', async () => {
    const page = await(Page())
    render(page)
    await waitFor(()=>{
      expect(VenueCatalog).toHaveBeenCalledTimes(1) 
    }) 
  })
})
