import React, { useEffect } from 'react'
import Header from '../header/Header'
import { Outlet } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { fetchCart } from '../../features/cartadd/cartSlice'

export default function Layout() {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(fetchCart())
  }, [dispatch])

  return (
    <>
      <Header />
      <Outlet />
    </>
  )
}
