import PriceChange from './PriceChange.jsx'

function formatDate(dateStr) {
  if (!dateStr) return '—'
  // Parse as local date to avoid UTC offset shifting the day
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function PriceTable({ prices, search = '' }) {
  return (
    // The wrapper lets the table scroll sideways on small phone screens
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Crop</th>
            <th>Market</th>
            <th>District</th>
            <th>Price (RWF / kg)</th>
            <th>Change vs last week</th>
            <th>Last updated</th>
          </tr>
        </thead>
        <tbody>
          {prices.length === 0 && (
            <tr>
              <td colSpan="6">
                {search ? `No prices found for "${search}"` : 'No prices found.'}
              </td>
            </tr>
          )}
          {prices.map((item) => (
            <tr key={item.id}>
              <td>{item.crop}</td>
              <td>{item.market}</td>
              <td>{item.district}</td>
              <td>
                <strong>{item.pricePerKg} RWF</strong>
              </td>
              <td>
                <PriceChange change={item.change} />
              </td>
              <td>{formatDate(item.date)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default PriceTable
