import { createFileRoute } from '@tanstack/react-router'
import { ServiceArea, CtaBand } from '#/components/Sections'

export const Route = createFileRoute('/_site/area')({
  head: () => ({ meta: [{ title: 'Service area' }] }),
  component: () => (
    <>
      <ServiceArea h1 />
      <CtaBand title="Not sure we cover your street?" />
    </>
  ),
})
