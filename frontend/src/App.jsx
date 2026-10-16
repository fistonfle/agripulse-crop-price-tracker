import { useEffect, useState } from 'react'
import PriceTable from './components/PriceTable.jsx'

function App() {
  const [prices, setPrices] = useState([])
  const [markets, setMarkets] = useState([])
  const [crop, setCrop] = useState('')
  const [market, setMarket] = useState('')
  const [error, setError] = useState('')

  // Load the market list once for the dropdown
  useEffect(() => {
    fetch('/api/markets')
      .then((res) => res.json())
      .then(setMarkets)
      .catch(() => setError('Could not load markets'))
  }, [])

  // Reload prices every time the search or market changes
  useEffect(() => {
    const params = new URLSearchParams()
    if (crop.trim()) params.append('crop', crop.trim())
    if (market) params.append('market', market)

    fetch(`/api/prices?${params}`)
      .then((res) => res.json())
      .then((data) => {
        setPrices(data)
        setError('')
      })
      .catch(() => setError('Could not load prices. Is the backend running?'))
  }, [crop, market])

  return (
    <main>
      <h1>🌾 AgriPulse: Rwandan Crop Price Tracker</h1>
      <p>Market prices for farmers and traders across Rwanda.</p>

      <div className="filters">
        <input
          type="text"
          placeholder="Search crop e.g. Beans"
          aria-label="Search crop"
          value={crop}
          onChange={(e) => setCrop(e.target.value)}
        />
        <select aria-label="Market" value={market} onChange={(e) => setMarket(e.target.value)}>
          <option value="">All markets</option>
          {markets.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="error">{error}</p>}

      <PriceTable prices={prices} searchText={crop} />
    </main>
  )
}

export default App
