import '@testing-library/jest-dom'
import getVenues from '@/libs/getVenues'
import VenueCatalog from '@/components/VenueCatalog'
import { screen, render, waitFor } from '@testing-library/react'

describe('Get Venues', () => {
  var venuePromise:Promise<Object>
  var venuesJsonResult:Object
  beforeEach(async () => {
    venuePromise = getVenues()
    venuesJsonResult = await venuePromise
  })

  it('getVenues must return correct results', () => {
    const resultData = venuesJsonResult.data
    expect(venuesJsonResult.count).toBe(3) 
    expect(resultData).toHaveLength(3)
    const ids = ["67d044e0c0062950a985c509", "67d04663c0062950a985c50c", "67d047cec0062950a985c50f"]
    expect(ids).toContain(resultData[0].id)  
  })

  it('Venue Catalog should have correct number of images', async () => {
    const catalog = await VenueCatalog({venuesJson: venuesJsonResult})
    render(catalog) 
    
    await waitFor(()=> {
      const venueImages = screen.queryAllByRole('img')
      expect(venueImages.length).toBe(3)
    })
    
  })
  
  
})
