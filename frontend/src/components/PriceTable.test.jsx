import { render, screen } from '@testing-library/react'
import PriceTable from './PriceTable.jsx'

const samplePrices = [
  { id: 1, crop: 'Maize', market: 'Kimironko', district: 'Gasabo', pricePerKg: 450, date: '2026-01-15' },
  { id: 3, crop: 'Beans', market: 'Nyabugogo', district: 'Nyarugenge', pricePerKg: 900, date: '2026-10-16' },
]

test('renders Last updated column heading', () => {
  render(<PriceTable prices={samplePrices} />)
  expect(screen.getByRole('columnheader', { name: 'Last updated' })).toBeInTheDocument()
})

test('displays formatted dates for each price', () => {
  render(<PriceTable prices={samplePrices} />)
  expect(screen.getByText('15 Jan 2026')).toBeInTheDocument()
  expect(screen.getByText('16 Oct 2026')).toBeInTheDocument()
})

test('multiple records show their respective dates', () => {
  render(<PriceTable prices={samplePrices} />)
  const cells = screen.getAllByRole('cell')
  const dateCells = cells.filter((c) => c.textContent === '15 Jan 2026' || c.textContent === '16 Oct 2026')
  expect(dateCells).toHaveLength(2)
})

test('handles missing date gracefully', () => {
  const prices = [{ id: 1, crop: 'Maize', market: 'Kimironko', district: 'Gasabo', pricePerKg: 450 }]
  render(<PriceTable prices={prices} />)
  expect(screen.getByText('—')).toBeInTheDocument()
})

test('empty state renders with five columns', () => {
  render(<PriceTable prices={[]} />)
  const cell = screen.getByText('No prices found.')
  expect(cell).toBeInTheDocument()
  expect(cell).toHaveAttribute('colspan', '5')
})
