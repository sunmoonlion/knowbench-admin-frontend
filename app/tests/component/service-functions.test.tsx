import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import { afterEach, expect, it, vi } from 'vitest'
import { ServiceFunctions } from '@/components/research/service-functions'
import en from '@/messages/en.json'

afterEach(() => vi.unstubAllGlobals())

it('inspects the selected provider and revision, then clears the detail on a new search', async () => {
  const rows = ['knowbase', 'knowfeed'].map((provider) => ({
    provider,
    name: 'query_facts',
    version: 1,
    digest: 'sha256:' + provider,
    description: provider + ' facts',
  }))
  const fetcher = vi.fn(async (path: string) => {
    const url = new URL(path, 'http://localhost')
    if (url.pathname.endsWith('/knowfeed/query_facts/1')) {
      return Response.json({
        revision: {
          ...rows[1],
          contract: {
            description: 'Second provider contract',
            operation: 'read_facts',
            scenes: ['incubation'],
            required_permissions: ['facts.read'],
            input_schema: { type: 'object' },
            output_schema: { type: 'object' },
          },
        },
        references: {
          items: [
            { method_id: 'method-2', title: 'Review facts', digest: 'sha256:method', version: 2 },
          ],
          has_more: false,
        },
      })
    }
    return Response.json({
      items: url.searchParams.get('q') === 'missing' ? [] : rows,
      has_more: false,
    })
  })
  vi.stubGlobal('fetch', fetcher)
  render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
    >
      <NextIntlClientProvider locale="en" messages={en} timeZone="UTC">
        <ServiceFunctions />
      </NextIntlClientProvider>
    </QueryClientProvider>,
  )
  fireEvent.click(await screen.findByRole('button', { name: 'knowfeed / query_facts · v1' }))
  expect(await screen.findByText('Review facts · v2')).toBeInTheDocument()
  expect(screen.getByText('facts.read')).toBeInTheDocument()
  fireEvent.change(screen.getByRole('textbox'), { target: { value: 'missing' } })
  fireEvent.click(screen.getByRole('button', { name: 'Search' }))
  await waitFor(() => expect(screen.getByText('No matching registrations.')).toBeInTheDocument())
  expect(screen.queryByText('Review facts · v2')).not.toBeInTheDocument()
})
