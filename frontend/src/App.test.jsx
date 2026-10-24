import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App.jsx'

const samplePrices = [
  { id: 1, crop: 'Maize', market: 'Kimironko', district: 'Gasabo', pricePerKg: 450, change: 50, date: '2026-01-15' },
  { id: 3, crop: 'Beans', market: 'Nyabugogo', district: 'Nyarugenge', pricePerKg: 900, change: -20, date: '2026-01-16' },
]

// Fake the backend so the tests don't need the API running
beforeEach(() => {
  localStorage.clear()
  globalThis.fetch = vi.fn((url) => {
    if (url === '/api/auth/login') {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ user: { id: 1, name: 'Aline Uwase' }, token: 'abc' }),
      })
    }
    let data = samplePrices
    if (url === '/api/markets') {
      data = ['Kimironko', 'Nyabugogo']
    } else if (url === '/api/districts') {
      data = ['Gasabo', 'Nyarugenge']
    } else if (url.includes('district=Gasabo')) {
      data = samplePrices.filter((p) => p.district === 'Gasabo')
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
  expect(await screen.findByText('No prices found for "xyz"')).toBeInTheDocument()
})


test('search ignores extra spaces', async () => {
  render(<App />)
  await screen.findByText('Maize')
  await userEvent.type(screen.getByLabelText('Search crop'), '  beans  ')
  expect(fetch).toHaveBeenLastCalledWith('/api/prices?crop=beans')
  expect(await screen.findByText('Beans')).toBeInTheDocument()
})

test('filtering by district updates the table', async () => {
  render(<App />)
  await screen.findByRole('option', { name: 'Gasabo' })
  await userEvent.selectOptions(screen.getByRole('combobox', { name: 'District' }), 'Gasabo')
  expect(fetch).toHaveBeenLastCalledWith('/api/prices?district=Gasabo')
  expect(await screen.findByText('Maize')).toBeInTheDocument()
})

test('shows the change since last week', async () => {
  render(<App />)
  expect(await screen.findByText('▲ +50 RWF')).toBeInTheDocument()
  expect(screen.getByText('▼ -20 RWF')).toBeInTheDocument()
})

test('shows the login form until the user logs in', async () => {
  render(<App />)
  expect(screen.getByRole('heading', { name: 'Log in to add prices' })).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Add price' })).not.toBeInTheDocument()

  await userEvent.type(screen.getByLabelText('Email'), 'aline@example.rw')
  await userEvent.type(screen.getByLabelText('Password'), 'password123')
  await userEvent.click(screen.getByRole('button', { name: 'Log in' }))

  expect(await screen.findByText('Aline Uwase')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Add price' })).toBeInTheDocument()

  await userEvent.click(screen.getByRole('button', { name: 'Log out' }))
  expect(screen.getByRole('button', { name: 'Log in' })).toBeInTheDocument()
})

test('stays logged in after a page refresh', async () => {
  localStorage.setItem('agripulse-auth', JSON.stringify({ user: { id: 1, name: 'Aline Uwase' }, token: 'abc' }))
  render(<App />)
  expect(screen.getByText('Aline Uwase')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Add price' })).toBeInTheDocument()
})
