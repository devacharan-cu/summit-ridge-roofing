import { createFileRoute } from '@tanstack/react-router'
import { Reviews, CtaBand } from '#/components/Sections'

export const Route = createFileRoute('/_site/reviews')({
  head: () => ({ meta: [{ title: 'Customer reviews' }] }),
  component: () => (
    <>
      <Reviews h1 />
      <CtaBand />
    </>
  ),
})
