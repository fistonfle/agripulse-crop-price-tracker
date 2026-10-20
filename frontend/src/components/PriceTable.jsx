function PriceTable({ prices, search = '' }) {
  return (
    <table>
      <thead>
        <tr>
          <th>Crop</th>
          <th>Market</th>
          <th>District</th>
          <th>Price (RWF / kg)</th>
        </tr>
      </thead>
      <tbody>
        {prices.length === 0 && (
          <tr>
            <td colSpan="4">
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
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default PriceTable
