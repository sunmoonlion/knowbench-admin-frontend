import { getTranslations } from 'next-intl/server'
import { ServiceFunctions } from '@/components/research/service-functions'
import { requireAnyRole } from '@/lib/server/auth-session'

export default async function MethodSkillCenterPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  await requireAnyRole(locale, ['admin', 'operator'])
  const t = await getTranslations('functions')
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">{t('title')}</h1>
      <ServiceFunctions />
    </section>
  )
}
