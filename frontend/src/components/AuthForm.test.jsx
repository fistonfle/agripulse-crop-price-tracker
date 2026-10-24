import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AuthForm from './AuthForm.jsx'

test('creates an account and passes the user to the parent', async () => {
  globalThis.fetch = vi.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ user: { id: 1, name: 'Aline' }, token: 'abc' }),
    }),
  )
  const onLogin = vi.fn()
  render(<AuthForm onLogin={onLogin} />)

  await userEvent.click(screen.getByRole('button', { name: 'Create one' }))
  await userEvent.type(screen.getByLabelText('Full name'), 'Aline')
  await userEvent.type(screen.getByLabelText('Email'), 'aline@example.rw')
  await userEvent.type(screen.getByLabelText('Password'), 'password123')
  await userEvent.click(screen.getByRole('button', { name: 'Create account' }))

  expect(fetch.mock.calls[0][0]).toBe('/api/auth/register')
  expect(onLogin).toHaveBeenCalledWith({ user: { id: 1, name: 'Aline' }, token: 'abc' })
})

test('shows the error for a wrong password', async () => {
  globalThis.fetch = vi.fn(() =>
    Promise.resolve({ ok: false, json: () => Promise.resolve({ error: 'Invalid email or password' }) }),
  )
  const onLogin = vi.fn()
  render(<AuthForm onLogin={onLogin} />)

  await userEvent.type(screen.getByLabelText('Email'), 'aline@example.rw')
  await userEvent.type(screen.getByLabelText('Password'), 'wrong')
  await userEvent.click(screen.getByRole('button', { name: 'Log in' }))

  expect(await screen.findByText('Invalid email or password')).toBeInTheDocument()
  expect(onLogin).not.toHaveBeenCalled()
})
