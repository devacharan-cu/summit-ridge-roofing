import { createFileRoute } from '@tanstack/react-router'
import { Services, CtaBand } from '#/components/Sections'

export const Route = createFileRoute('/_site/services/')({
  head: () => ({ meta: [{ title: 'Roofing services: repair, replacement, inspection' }] }),
  component: () => (
    <>
      <Services h1 />
      <CtaBand />
    </>
  ),
})
