import { useState } from 'react'

const emptyForm = { crop: '', market: '', district: '', pricePerKg: '' }

function AddPriceForm({ token, onAdded, onSessionExpired }) {
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState([])
  const [message, setMessage] = useState('')

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setMessage('')

    try {
      const res = await fetch('/api/prices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...form, pricePerKg: Number(form.pricePerKg) }),
      })
      const data = await res.json()

      // Token missing or expired: go back to the login form
      if (res.status === 401) {
        onSessionExpired()
        return
      }

      if (!res.ok) {
        setErrors(data.errors || ['Could not save the price'])
        return
      }

      setErrors([])
      setForm(emptyForm)
      setMessage(`Added ${data.crop} at ${data.market}`)
      onAdded()
    } catch {
      setErrors(['Could not reach the server'])
    }
  }

  return (
    <form className="add-form" onSubmit={handleSubmit}>
      <h3>Add a new price</h3>
      <div className="fields">
        <input name="crop" placeholder="Crop" aria-label="Crop" value={form.crop} onChange={handleChange} />
        <input name="market" placeholder="Market" aria-label="Market name" value={form.market} onChange={handleChange} />
        <input name="district" placeholder="District" aria-label="District" value={form.district} onChange={handleChange} />
        <input
          name="pricePerKg"
          type="number"
          min="1"
          placeholder="Price (RWF/kg)"
          aria-label="Price per kg"
          value={form.pricePerKg}
          onChange={handleChange}
        />
        <button type="submit">Add price</button>
      </div>

      {errors.length > 0 && (
        <ul className="error">
          {errors.map((err) => (
            <li key={err}>{err}</li>
          ))}
        </ul>
      )}
      {message && <p className="success">{message}</p>}
    </form>
  )
}

export default AddPriceForm
