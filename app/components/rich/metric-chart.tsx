export type MetricPoint = { label: string; value: number }

export function MetricChart({
  title,
  points,
  loading,
  error,
}: {
  title: string
  points: readonly MetricPoint[]
  loading?: boolean
  error?: string
}) {
  if (loading) return <div className="rich-state" aria-busy="true">Loading chart…</div>
  if (error) return <div className="rich-state crud-error" role="alert">{error}</div>
  if (!points.length) return <div className="rich-state">No chart data</div>
  const min = Math.min(0, ...points.map((point) => point.value))
  const max = Math.max(0, ...points.map((point) => point.value))
  const magnitude = Math.max(-min, max) || 1
  const span = (max / magnitude - min / magnitude) || 1
  const width = 480
  const height = 180
  const zero = 10 + (max / magnitude / span) * (height - 30)
  const barWidth = width / points.length
  return (
    <figure className="metric-chart">
      <figcaption>{title}</figcaption>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={title}>
        <line x1={0} x2={width} y1={zero} y2={zero} stroke="currentColor" opacity={0.35} />
        {points.map((point, index) => {
          const barHeight = Math.abs(point.value / magnitude / span) * (height - 30)
          return (
            <g key={point.label}>
              <rect
                x={index * barWidth + 8}
                y={point.value > 0 ? zero - barHeight : zero}
                width={Math.max(8, barWidth - 16)}
                height={barHeight}
                rx={4}
              />
              <text x={index * barWidth + barWidth / 2} y={height - 5} textAnchor="middle">
                {point.label}
              </text>
            </g>
          )
        })}
      </svg>
      <table>
        <caption className="sr-only">{title} data</caption>
        <thead><tr><th>Label</th><th>Value</th></tr></thead>
        <tbody>{points.map((point) => <tr key={point.label}><td>{point.label}</td><td>{point.value}</td></tr>)}</tbody>
      </table>
    </figure>
  )
}
