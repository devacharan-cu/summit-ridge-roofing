import { createFileRoute } from '@tanstack/react-router'
import { Reviews, CtaBand } from '#/components/Sections'
import { pageTitle } from '#/config/site'

export const Route = createFileRoute('/_site/reviews')({
  head: () => ({ meta: [{ title: pageTitle('Customer Reviews') }] }),
  component: () => (
    <>
      <Reviews h1 />
      <CtaBand />
    </>
  ),
})
