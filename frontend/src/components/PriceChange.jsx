// Shows how a price moved since last week.
// For buyers a lower price is good news, so "down" is green and "up" is red.
function PriceChange({ change }) {
  if (change === null || change === undefined) {
    return <span className="change new">New</span>
  }
  if (change > 0) {
    return <span className="change up">▲ +{change} RWF</span>
  }
  if (change < 0) {
    return <span className="change down">▼ {change} RWF</span>
  }
  return <span className="change same">— No change</span>
}

export default PriceChange
