import React, { useEffect } from 'react'
import Header from '../header/Header'
import Footer from '../Footer'
import { Outlet } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { fetchCart } from '../../features/cartadd/cartSlice'
import ScrollToTop from '../ScrollToTop'

export default function Layout() {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(fetchCart())
  }, [dispatch])

  return (
    <>
      <ScrollToTop />
      <Header />
      <main className="min-h-screen">
        <Outlet />
      </main>
      <Footer />
    </>
  )
}
