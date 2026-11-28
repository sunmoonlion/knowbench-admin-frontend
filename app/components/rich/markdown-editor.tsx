'use client'

import { useId } from 'react'

export function MarkdownEditor({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange(value: string): void
}) {
  const sourceId = useId()
  return (
    <div className="markdown-editor">
      <label htmlFor={sourceId}>{label}</label>
      <textarea
        id={sourceId}
        value={value}
        maxLength={20_000}
        rows={7}
        onChange={(event) => onChange(event.target.value)}
      />
      <section aria-label={`${label} preview`}>
        <strong>Plain-text safe preview</strong>
        <pre>{value}</pre>
      </section>
    </div>
  )
}
