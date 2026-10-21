import PriceChange from './PriceChange.jsx'

function PriceTable({ prices }) {
  return (
    <table>
      <thead>
        <tr>
          <th>Crop</th>
          <th>Market</th>
          <th>District</th>
          <th>Price (RWF / kg)</th>
          <th>Change vs last week</th>
        </tr>
      </thead>
      <tbody>
        {prices.length === 0 && (
          <tr>
            <td colSpan="5">No prices found.</td>
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
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default PriceTable
