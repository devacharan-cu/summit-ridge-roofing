import { createFileRoute } from '@tanstack/react-router'
import { Offers, CtaBand } from '#/components/Sections'
import { getOfferPrices } from '#/lib/api'

export const Route = createFileRoute('/_site/book')({
  head: () => ({ meta: [{ title: 'Book online: inspection, deposit, flat-rate services' }] }),
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
