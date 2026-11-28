import { useId } from 'react'

export function ResourceDescription({
  title,
  items,
  emptyLabel = '—',
}: {
  title: string
  items: readonly { label: string; value: React.ReactNode }[]
  emptyLabel?: string
}) {
  const titleId = useId()
  return (
    <section className="resource-description" aria-labelledby={titleId}>
      <h2 id={titleId}>{title}</h2>
      <dl>
        {items.map((item) => (
          <div key={item.label}>
            <dt>{item.label}</dt>
            <dd>{item.value === null || item.value === undefined || item.value === '' ? emptyLabel : item.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
