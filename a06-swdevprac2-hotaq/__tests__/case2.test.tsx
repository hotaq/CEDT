import '@testing-library/jest-dom'
import { render, screen, within, waitFor, fireEvent } from '@testing-library/react'
import CardPanel from '@/components/CardPanel'

describe('CardPanel', () => {
  it('CardPanel support ratings', async () => {
    render(<CardPanel/>)

    const bloomRating = screen.getByTestId("The Bloom Pavilion Rating")
    const sparkRating = screen.getByTestId("Spark Space Rating")
    const grandRating = screen.getByTestId("The Grand Table Rating")

    expect(bloomRating).toBeInTheDocument
    expect(sparkRating).toBeInTheDocument
    expect(grandRating).toBeInTheDocument

    const bloomFour = within(bloomRating).getByRole('radio', {name: "4 Stars"}) as HTMLElement
    expect(bloomFour).toBeInTheDocument
    fireEvent.click(bloomFour)
    await waitFor(() => {
      const bloomDisplay = screen.getByTestId("The Bloom Pavilion")
      expect(bloomDisplay).toBeInTheDocument
      expect(bloomDisplay.innerHTML).toMatch(/4/i)
    })

    const sparkThree = within(sparkRating).getByRole('radio', {name: "3 Stars"}) as HTMLElement
    expect(sparkThree).toBeInTheDocument
    fireEvent.click(sparkThree)
    await waitFor(() => {
      const sparkDisplay = screen.getByTestId("Spark Space")
      expect(sparkDisplay).toBeInTheDocument
      expect(sparkDisplay.innerHTML).toMatch(/3/i)
      expect(sparkThree).toBeChecked()
    })

    const sparkDisplay = screen.getByTestId("Spark Space")
    expect(sparkDisplay).toBeInTheDocument
    fireEvent.click(sparkDisplay)
    await waitFor(() => {
      const sparkDisplay = screen.queryAllByTestId("Spark Space")
      expect(sparkDisplay).toHaveLength(0)
    })

  } //end it
  )
})



