import { createContext } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import userStore from './store/UserStore'
import deviceStore from './store/DeviceStore'
import CartStore from './store/CartStore.js'
import { GoogleOAuthProvider } from '@react-oauth/google';

export const Context = createContext(null)

createRoot(document.getElementById('root')).render(
  <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
    <Context.Provider value={{
      user: userStore,
      device: new deviceStore(),
      cart: new CartStore()
    }}>
    <App />
    </Context.Provider>
  </GoogleOAuthProvider>
)
