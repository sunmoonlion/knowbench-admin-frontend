'use client'

import { useQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { requestJson } from '@/lib/api/client'
import { Button } from '@/components/ui/button'

type Summary = {
  provider: string
  name: string
  version: number
  description: string
  digest: string
}
type Page<T> = { items: T[]; has_more: boolean }
type Method = { method_id: string; version: number; digest: string; title: string }
type Detail = {
  revision: Omit<Summary, 'description'> & {
    contract: {
      description: string
      operation: string
      scenes: string[]
      required_permissions: string[]
      input_schema: object
      output_schema: object
    }
  }
  references: Page<Method>
}
const endpoint = '/api/admin/v1/method-skill-center/functions'
const size = 25
const keyOf = (row: Summary) =>
  [row.provider, row.name, row.version].map(String).map(encodeURIComponent).join('/')

function Paging({
  offset,
  more,
  change,
}: {
  offset: number
  more: boolean
  change: (offset: number) => void
}) {
  const t = useTranslations('functions')
  if (!offset && !more) return null
  return (
    <div className="flex gap-2">
      <Button variant="outline" disabled={!offset} onClick={() => change(offset - size)}>
        {t('previous')}
      </Button>
      <Button variant="outline" disabled={!more} onClick={() => change(offset + size)}>
        {t('next')}
      </Button>
    </div>
  )
}

function Inspection({ identity }: { identity: string }) {
  const t = useTranslations('functions')
  const [offset, setOffset] = useState(0)
  const query = useQuery({
    queryKey: ['service-function', identity, offset],
    queryFn: ({ signal }) =>
      requestJson<Detail>(endpoint + '/' + identity + '?limit=' + size + '&offset=' + offset, {
        signal,
      }),
  })
  if (query.isError)
    return (
      <Button variant="outline" onClick={() => void query.refetch()}>
        {t('retry')}
      </Button>
    )
  if (!query.data) return <p role="status">{t('loading')}</p>
  const { revision, references } = query.data
  const c = revision.contract
  return (
    <section className="space-y-3 rounded-md border p-4">
      <h2 className="font-semibold">
        {revision.provider} / {revision.name} · v{revision.version}
      </h2>
      <p>{c.description}</p>
      <dl className="grid gap-1 text-sm">
        <dt>{t('digest')}</dt>
        <dd className="font-mono break-all">{revision.digest}</dd>
        <dt>{t('operation')}</dt>
        <dd>{c.operation}</dd>
        <dt>{t('scenes')}</dt>
        <dd>{c.scenes.map((scene) => t('scene.' + scene)).join(' / ')}</dd>
        <dt>{t('permissions')}</dt>
        <dd>{c.required_permissions.join(', ') || t('none')}</dd>
      </dl>
      {(['input_schema', 'output_schema'] as const).map((k) => (
        <details key={k}>
          <summary>{t(k)}</summary>
          <pre className="overflow-auto text-xs">{JSON.stringify(c[k], null, 2)}</pre>
        </details>
      ))}
      <h3 className="font-semibold">{t('references')}</h3>
      {!references.items.length && <p>{t('unused')}</p>}
      <ul>
        {references.items.map((m) => (
          <li key={m.method_id + ':' + m.version} className="mb-2">
            {m.title} · v{m.version}
            <div className="font-mono text-xs break-all">
              {m.method_id} · {m.digest}
            </div>
          </li>
        ))}
      </ul>
      <Paging offset={offset} more={references.has_more} change={setOffset} />
    </section>
  )
}

export function ServiceFunctions() {
  const t = useTranslations('functions')
  const [input, setInput] = useState('')
  const [q, setQ] = useState('')
  const [offset, setOffset] = useState(0)
  const [selected, select] = useState('')
  const query = useQuery({
    queryKey: ['service-functions', q, offset],
    queryFn: ({ signal }) =>
      requestJson<Page<Summary>>(
        endpoint + '?' + new URLSearchParams({ q, limit: String(size), offset: String(offset) }),
        { signal },
      ),
  })
  return (
    <div className="space-y-4">
      <form
        className="flex items-end gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          setQ(input.trim())
          setOffset(0)
          select('')
        }}
      >
        <label className="flex flex-col gap-1 text-sm">
          {t('searchLabel')}
          <input
            className="rounded-md border p-2"
            maxLength={160}
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </label>
        <Button type="submit">{t('search')}</Button>
      </form>
      {query.isError ? (
        <Button variant="outline" onClick={() => void query.refetch()}>
          {t('retry')}
        </Button>
      ) : !query.data ? (
        <p role="status">{t('loading')}</p>
      ) : (
        <>
          {!query.data.items.length && <p>{t('empty')}</p>}
          <ul className="divide-y">
            {query.data.items.map((r) => (
              <li key={keyOf(r)} className="py-2">
                <button
                  type="button"
                  className="text-left underline"
                  aria-pressed={selected === keyOf(r)}
                  onClick={() => select(keyOf(r))}
                >
                  {r.provider} / {r.name} · v{r.version}
                </button>
                <p className="text-muted-foreground text-sm">{r.description}</p>
              </li>
            ))}
          </ul>
          <Paging
            offset={offset}
            more={query.data.has_more}
            change={(n) => {
              setOffset(n)
              select('')
            }}
          />
        </>
      )}
      {selected && <Inspection key={selected} identity={selected} />}
    </div>
  )
}
