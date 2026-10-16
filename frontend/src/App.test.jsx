import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App.jsx'

const samplePrices = [
  { id: 1, crop: 'Maize', market: 'Kimironko', district: 'Gasabo', pricePerKg: 450 },
  { id: 3, crop: 'Beans', market: 'Nyabugogo', district: 'Nyarugenge', pricePerKg: 900 },
]

// Fake the backend so the tests don't need the API running
beforeEach(() => {
  globalThis.fetch = vi.fn((url) => {
    let data = samplePrices
    if (url === '/api/markets') {
      data = ['Kimironko', 'Nyabugogo']
    } else if (url.includes('crop=beans')) {
      data = samplePrices.filter((p) => p.crop === 'Beans')
    } else if (url.includes('crop=xyz')) {
      data = []
    }
    return Promise.resolve({ json: () => Promise.resolve(data) })
  })
})

test('shows the crop prices', async () => {
  render(<App />)
  expect(await screen.findByText('Maize')).toBeInTheDocument()
  expect(screen.getByText('Beans')).toBeInTheDocument()
})

test('fills the market dropdown', async () => {
  render(<App />)
  expect(await screen.findByRole('option', { name: 'Kimironko' })).toBeInTheDocument()
})

test('searching for a crop updates the table', async () => {
  render(<App />)
  await screen.findByText('Maize')
  await userEvent.type(screen.getByLabelText('Search crop'), 'beans')
  expect(fetch).toHaveBeenLastCalledWith('/api/prices?crop=beans')
  expect(await screen.findByText('Beans')).toBeInTheDocument()
})

test('shows a message when nothing is found', async () => {
  render(<App />)
  await userEvent.type(screen.getByLabelText('Search crop'), 'xyz')
  expect(await screen.findByText('No prices found.')).toBeInTheDocument()
})
