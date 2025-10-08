import { createContext } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import userStore from './store/UserStore'
import deviceStore from './store/DeviceStore'
import CartStore from './store/CartStore.js'

export const Context = createContext(null)

createRoot(document.getElementById('root')).render(
    <Context.Provider value={{
      user: new userStore(),
      device: new deviceStore(),
      cart: new CartStore()
    }}>
      <App />
    </Context.Provider>
)
 {/* <Context.Provider is it okay performance-wise (in comparison to Zustand and Redux) */}