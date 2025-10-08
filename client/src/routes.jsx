import { lazy } from 'react'
import { ADMIN_ROUTE, BASKET_ROUTE, DEVICE_ROUTE, LOGIN_ROUTE, REGISTRATION_ROUTE, SHOP_ROUTE } from './utils/constants'

const Admin = lazy(() => import('./pages/Admin'));
const Shop = lazy(() => import('./pages/Shop'));
const Auth = lazy(() => import('./pages/Auth'));
const Basket = lazy(() => import('./pages/Basket'));
const DevicePage = lazy(() => import('./pages/DevicePage'));

export const authRoutes = [
  {
    path: ADMIN_ROUTE,
    Component: Admin
  }
]

export const publicRoutes = [
  {
    path: SHOP_ROUTE,
    Component: Shop
  },
  {
    path: LOGIN_ROUTE,
    Component: Auth
  },
  {
    path: REGISTRATION_ROUTE,
    Component: Auth
  },
  {
    path: BASKET_ROUTE,
    Component: Basket
  }, 
  {
    path: DEVICE_ROUTE + '/:id',
    Component: DevicePage
  },
]
