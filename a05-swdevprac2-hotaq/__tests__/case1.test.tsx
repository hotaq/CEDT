import '@testing-library/jest-dom'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import InteractiveCard from '@/components/InteractiveCard'
import { ReactNode } from 'react'

describe('InteractiveCard', () => {
  it('InteractiveCard has correct class', async() => {
    render(<InteractiveCard><span>Hello</span></InteractiveCard>)
    const spanElement = screen.getByText('Hello') as HTMLElement
    const card = spanElement.parentElement as Element
    expect(card?.classList).toContain("shadow-lg")
    expect(card?.classList).toContain("bg-white")
    expect(card?.classList).toContain("rounded-lg")

    fireEvent.mouseOver(card)
    await waitFor(()=> screen.getByText('Hello'))
    const mouseOverSpan = screen.getByText('Hello') as HTMLElement
    const mouseOverCard = mouseOverSpan.parentElement as Element
    expect(mouseOverCard?.classList).toContain("shadow-2xl")
    expect(mouseOverCard?.classList).toContain("bg-neutral-200")
    expect(mouseOverCard?.classList).toContain("rounded-lg")    
  })
})
