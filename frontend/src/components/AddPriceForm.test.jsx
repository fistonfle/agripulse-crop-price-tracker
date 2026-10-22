import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AddPriceForm from './AddPriceForm.jsx'

async function fillForm() {
  await userEvent.type(screen.getByLabelText('Crop'), 'Sorghum')
  await userEvent.type(screen.getByLabelText('Market name'), 'Huye')
  await userEvent.type(screen.getByLabelText('District'), 'Huye')
  await userEvent.type(screen.getByLabelText('Price per kg'), '600')
}

test('sends the new price and tells the parent', async () => {
  globalThis.fetch = vi.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ id: 9, crop: 'Sorghum', market: 'Huye', district: 'Huye', pricePerKg: 600 }),
    }),
  )
  const onAdded = vi.fn()
  render(<AddPriceForm token="test-token" onAdded={onAdded} onSessionExpired={vi.fn()} />)

  await fillForm()
  await userEvent.click(screen.getByRole('button', { name: 'Add price' }))

  // The login token is sent with the request
  expect(fetch.mock.calls[0][1].headers.Authorization).toBe('Bearer test-token')
  const body = JSON.parse(fetch.mock.calls[0][1].body)
  expect(body).toEqual({ crop: 'Sorghum', market: 'Huye', district: 'Huye', pricePerKg: 600 })
  expect(await screen.findByText('Added Sorghum at Huye')).toBeInTheDocument()
  expect(onAdded).toHaveBeenCalled()
  expect(screen.getByLabelText('Crop')).toHaveValue('')
})

test('shows errors from the server', async () => {
  globalThis.fetch = vi.fn(() =>
    Promise.resolve({
      ok: false,
      json: () => Promise.resolve({ errors: ['market is required'] }),
    }),
  )
  const onAdded = vi.fn()
  render(<AddPriceForm token="test-token" onAdded={onAdded} onSessionExpired={vi.fn()} />)

  await userEvent.type(screen.getByLabelText('Crop'), 'Maize')
  await userEvent.click(screen.getByRole('button', { name: 'Add price' }))

  expect(await screen.findByText('market is required')).toBeInTheDocument()
  expect(onAdded).not.toHaveBeenCalled()
})

test('goes back to login when the session has expired', async () => {
  globalThis.fetch = vi.fn(() =>
    Promise.resolve({ ok: false, status: 401, json: () => Promise.resolve({ error: 'expired' }) }),
  )
  const onSessionExpired = vi.fn()
  render(<AddPriceForm token="old-token" onAdded={vi.fn()} onSessionExpired={onSessionExpired} />)

  await fillForm()
  await userEvent.click(screen.getByRole('button', { name: 'Add price' }))

  expect(onSessionExpired).toHaveBeenCalled()
})
