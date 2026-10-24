import { useState } from 'react'

// One form for both "Log in" and "Create account"
function AuthForm({ onLogin }) {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [errors, setErrors] = useState([])

  const isRegister = mode === 'register'

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function switchMode() {
    setMode(isRegister ? 'login' : 'register')
    setErrors([])
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const body = isRegister ? form : { email: form.email, password: form.password }

    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()

      if (!res.ok) {
        setErrors(data.errors || [data.error || 'Something went wrong'])
        return
      }
      onLogin(data)
    } catch {
      setErrors(['Could not reach the server'])
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <h3>{isRegister ? 'Create an account' : 'Log in to add prices'}</h3>
      <div className="fields">
        {isRegister && (
          <input name="name" placeholder="Full name" aria-label="Full name" value={form.name} onChange={handleChange} />
        )}
        <input name="email" type="email" placeholder="Email" aria-label="Email" value={form.email} onChange={handleChange} />
        <input
          name="password"
          type="password"
          placeholder={isRegister ? 'Password (min 8 characters)' : 'Password'}
          aria-label="Password"
          value={form.password}
          onChange={handleChange}
        />
        <button type="submit">{isRegister ? 'Create account' : 'Log in'}</button>
      </div>

      {errors.length > 0 && (
        <ul className="error">
          {errors.map((err) => (
            <li key={err}>{err}</li>
          ))}
        </ul>
      )}

      <p>
        {isRegister ? 'Already have an account?' : 'No account yet?'}{' '}
        <button type="button" className="link-button" onClick={switchMode}>
          {isRegister ? 'Log in' : 'Create one'}
        </button>
      </p>
    </form>
  )
}

export default AuthForm
