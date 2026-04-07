import '@testing-library/jest-dom'
import getVenue from '@/libs/getVenue'

describe('Get Venue by ID', () => {
  var venueByIdPromise:Promise<Object>
  var venueJsonResult:Object
  beforeEach(async () => {
    venueByIdPromise = getVenue('67d044e0c0062950a985c509')
    venueJsonResult = await venueByIdPromise
  })

  it('getVenue must return correct result', () => {
    const resultData = venueJsonResult.data
    expect(resultData.name).toMatch(/The Bloom Pavilion/i) 
  })
})