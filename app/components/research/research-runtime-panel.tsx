'use client'

import { useTranslations } from 'next-intl'

export function ResearchRuntimePanel() {
  const t = useTranslations('ResearchRuntime')
  return (
    <section className="mt-6 space-y-3 rounded-lg border border-border p-4">
      <h2 className="text-lg font-medium">{t('title')}</h2>
      <p className="text-sm text-muted-foreground">{t('description')}</p>
      <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
        <li><code>POST /api/workbench/sessions</code></li>
        <li><code>{'POST /api/workbench/sessions/{session_id}/turns'}</code></li>
        <li><code>{'GET /api/workbench/sessions/{session_id}/stream'}</code></li>
      </ul>
    </section>
  )
}
