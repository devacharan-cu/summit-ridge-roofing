import { createFileRoute, Outlet } from '@tanstack/react-router'
import { Header, Footer } from '#/components/Header'
import { MotionRoot } from '#/components/Motion'
import { PixelDebug } from '#/components/PixelDebug'

/** Shared layout: the header persists across pages so route changes feel like one app. */
export const Route = createFileRoute('/_site')({
  component: () => (
    <>
      <Header />
      <MotionRoot />
      <main id="main">
        <Outlet />
      </main>
      <Footer />
      <PixelDebug />
    </>
  ),
})
