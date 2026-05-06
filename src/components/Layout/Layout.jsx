import React, { useEffect } from 'react'
import Header from '../header/Header'
import Footer from '../Footer'
import { Outlet } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { fetchCart } from '../../features/cartadd/cartSlice'
import api from '../../utils/api.js'
import ScrollToTop from '../ScrollToTop'

const applyTheme = (theme = {}) => {
  const root = document.documentElement
  root.style.setProperty('--color-primary', theme.primaryColor || '#10b981')
  root.style.setProperty('--color-primary-dark', theme.primaryColorDark || '#0f766e')
  root.style.setProperty('--color-primary-soft', theme.primaryColorSoft || '#dcfce7')
  root.style.setProperty('--color-secondary', theme.secondaryColor || '#f59e0b')
  root.style.setProperty('--color-secondary-soft', theme.secondaryColorSoft || '#fef3c7')
}

export default function Layout() {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(fetchCart())
  }, [dispatch])

  useEffect(() => {
    const fetchHomepageTheme = async () => {
      try {
        const response = await api.get('/homepage')
        applyTheme(response.data.theme)
      } catch (error) {
        console.error('Could not load homepage theme:', error)
      }
    }

    fetchHomepageTheme()
  }, [])

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
