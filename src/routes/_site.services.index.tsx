import { createFileRoute } from '@tanstack/react-router'
import { Services, CtaBand } from '#/components/Sections'
import { pageTitle } from '#/config/site'

export const Route = createFileRoute('/_site/services/')({
  head: () => ({ meta: [{ title: pageTitle('Roofing Services') }] }),
  component: () => (
    <>
      <Services h1 />
      <CtaBand />
    </>
  ),
})
