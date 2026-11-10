import { createFileRoute } from '@tanstack/react-router'
import { EstimateSection } from '#/components/EstimateForm'

export const Route = createFileRoute('/_site/contact')({
  validateSearch: (s: Record<string, unknown>): { service?: string } => (typeof s.service === 'string' ? { service: s.service } : {}),
  head: () => ({ meta: [{ title: 'Free roofing estimate' }] }),
  component: () => {
    const { service } = Route.useSearch()
    return <EstimateSection h1 defaultService={service} />
  },
})
