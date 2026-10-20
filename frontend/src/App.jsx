import { useEffect, useState } from 'react'
import PriceTable from './components/PriceTable.jsx'
import AddPriceForm from './components/AddPriceForm.jsx'

function App() {
  const [prices, setPrices] = useState([])
  const [markets, setMarkets] = useState([])
  const [districts, setDistricts] = useState([])
  const [crop, setCrop] = useState('')
  const [market, setMarket] = useState('')
  const [district, setDistrict] = useState('')
  const [error, setError] = useState('')
  // Changing this number reloads the data (used after adding a price)
  const [refresh, setRefresh] = useState(0)

  // Load the market list for the dropdown
  useEffect(() => {
    fetch('/api/markets')
      .then((res) => res.json())
      .then(setMarkets)
      .catch(() => setError('Could not load markets'))
  }, [refresh])

  // Load the district list for the dropdown
  useEffect(() => {
    fetch('/api/districts')
      .then((res) => res.json())
      .then(setDistricts)
      .catch(() => setError('Could not load districts'))
  }, [refresh])

  // Reload prices every time the search or market changes
  useEffect(() => {
    const params = new URLSearchParams()
    if (crop) params.append('crop', crop)
    if (market) params.append('market', market)
    if (district) params.append('district', district)
    fetch(`/api/prices?${params}`)
      .then((res) => res.json())
      .then((data) => {
        setPrices(data)
        setError('')
      })
      .catch(() => setError('Could not load prices. Is the backend running?'))
  }, [crop, market, district, refresh])

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
        <select
          aria-label="District"
          value={district}
          onChange={(e) => setDistrict(e.target.value)}
        >
          <option value="">All districts</option>
          {districts.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="error">{error}</p>}

      <PriceTable prices={prices} />

      <AddPriceForm onAdded={() => setRefresh(refresh + 1)} />
    </main>
  )
}

export default App
