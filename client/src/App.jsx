import { BrowserRouter } from 'react-router-dom'
import AppRouter from './components/AppRouter'
import NavBar from './components/NavBar'
import { observer } from 'mobx-react-lite'
import { useContext, useEffect, useState } from 'react'
import { Context } from './main'
import { check } from './http/userAPI'
import { CenteredSpinner } from './components/Spinner'

const App = observer(() => {
  const { user } = useContext(Context)
  const [loading, setLoading] = useState(true)
  const token = localStorage.getItem('token')

  useEffect(() => {
    if (token) {
      check().then(data => {
        user.setUser(data)
        user.setIsAuth(true)
      }).finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  if (loading) {
    return (
      <CenteredSpinner 
        animation="grow" 
        variant="primary" 
        size="lg"
      ></CenteredSpinner>
    )
  }

  return (
    <BrowserRouter>
      <NavBar />
      <AppRouter />
    </BrowserRouter>
  ) 
})

export default App
