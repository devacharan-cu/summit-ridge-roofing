import { createFileRoute } from '@tanstack/react-router'
import { Offers, CtaBand } from '#/components/Sections'
import { getOfferPrices } from '#/lib/api'
import { pageTitle } from '#/config/site'

export const Route = createFileRoute('/_site/book')({
  head: () => ({ meta: [{ title: pageTitle('Book Online') }] }),
  loader: () => getOfferPrices(),
  component: () => {
    const prices = Route.useLoaderData()
    return (
      <>
        <Offers prices={prices} h1 />
        <CtaBand title="Not sure which one you need?" />
      </>
    )
  },
})
