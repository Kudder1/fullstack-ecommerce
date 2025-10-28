import { lazy } from 'react'
import { ADMIN_ROUTE, BASKET_ROUTE, DEVICE_ROUTE, LOGIN_ROUTE, NEW_PASSWORD_ROUTE, PASSWORD_RECOVERY_ROUTE, PAYMENT_SUCCESS_ROUTE, REGISTRATION_ROUTE, SHOP_ROUTE, VERIFY_EMAIL_ROUTE } from './utils/constants'

const Admin = lazy(() => import('./pages/Admin'));
const Shop = lazy(() => import('./pages/Shop'));
const Auth = lazy(() => import('./pages/Auth'));
const Basket = lazy(() => import('./pages/Basket'));
const DevicePage = lazy(() => import('./pages/DevicePage'));
const Confirmation = lazy(() => import('./pages/Confirmation'));
const PasswordRecovery = lazy(() => import('./pages/PasswordRecovery'));
const NewPassword = lazy(() => import('./pages/NewPassword'));
const PaymentSuccess = lazy(() => import('./pages/PaymentSuccess'));

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
  {
    path: VERIFY_EMAIL_ROUTE,
    Component: Confirmation
  },
  {
    path: PASSWORD_RECOVERY_ROUTE,
    Component: PasswordRecovery
  },
  {
    path: NEW_PASSWORD_ROUTE,
    Component: NewPassword
  },
  {
    path: PAYMENT_SUCCESS_ROUTE,
    Component: PaymentSuccess
  },
]
