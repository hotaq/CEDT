import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import Card from '@/components/Card'

describe('Card', () => {
  it('Card contains correct image', () => {
    const testSrc = "/img/bloom.jpg"
    const testName = "The Bloom Pavilion"
    render(<Card imgSrc={testSrc} venueName={testName} />)
    const cardImages = screen.queryAllByRole("img")
    const cardText = screen.getByText(new RegExp(testName, "i"))
    expect(cardImages).toHaveLength(1)
    expect(cardText).toBeInTheDocument
  })
})