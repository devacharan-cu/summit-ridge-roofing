import { createFileRoute } from '@tanstack/react-router'
import { Hero } from '#/components/Hero'
import { Bento, Offers, Reviews, CtaBand, PhotoBand } from '#/components/Sections'
import { getOfferPrices } from '#/lib/api'

export const Route = createFileRoute('/_site/')({
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
