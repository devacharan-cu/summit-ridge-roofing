import { createFileRoute } from '@tanstack/react-router'
import { ServiceArea, CtaBand } from '#/components/Sections'
import { pageTitle } from '#/config/site'

export const Route = createFileRoute('/_site/area')({
  head: () => ({ meta: [{ title: pageTitle('Service Area') }] }),
  component: () => (
    <>
      <ServiceArea h1 />
      <CtaBand title="Not sure we cover your street?" />
    </>
  ),
})
