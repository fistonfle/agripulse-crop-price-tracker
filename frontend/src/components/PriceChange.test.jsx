import { render, screen } from '@testing-library/react'
import PriceChange from './PriceChange.jsx'

test('shows a price increase', () => {
  render(<PriceChange change={50} />)
  expect(screen.getByText('▲ +50 RWF')).toHaveClass('up')
})

test('shows a price decrease', () => {
  render(<PriceChange change={-30} />)
  expect(screen.getByText('▼ -30 RWF')).toHaveClass('down')
})

test('shows no change', () => {
  render(<PriceChange change={0} />)
  expect(screen.getByText('— No change')).toBeInTheDocument()
})

test('shows New when there is no history', () => {
  render(<PriceChange change={null} />)
  expect(screen.getByText('New')).toBeInTheDocument()
})
