import { createFileRoute } from '@tanstack/react-router'
import { Hero } from '#/components/Hero'
import { Bento, Offers, Reviews, CtaBand, PhotoBand } from '#/components/Sections'
import { getOfferPrices } from '#/lib/api'
import { site } from '#/config/site'

export const Route = createFileRoute('/_site/')({
  head: () => ({
    meta: [
      { title: `${site.company.name} | Roof Repair, Replacement & Inspection in ${site.company.city}` },
    ],
  }),
  loader: () => getOfferPrices(),
  component: Home,
})

function Home() {
  const prices = Route.useLoaderData()
  return (
    <>
      <Hero />
      <PhotoBand />
      <Bento />
      <Offers prices={prices} />
      <Reviews limit={3} />
      <CtaBand />
    </>
  )
}
