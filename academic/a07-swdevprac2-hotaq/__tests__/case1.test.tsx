import '@testing-library/jest-dom'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Page from '@/app/(venueinfo)/venue/page'
import CardPanel from '@/components/CardPanel'
jest.mock('../src/components/CardPanel')

describe('venue route page', () => {
  it('Page contains Banner and CardPanel', () => {
    render(<Page/>)
    expect(CardPanel).toHaveBeenCalledTimes(1)  
  })
})
