import { useLocation } from 'react-router-dom';
import './Auth.css';
import { useContext, useEffect, useState } from 'react';
import { getPaypalOrder, verifyStripeCheckoutSession } from '../http/cartAPI';
import { observer } from 'mobx-react-lite';
import { Context } from '../main';

const PaymentSuccess = observer(() => {
  const location = useLocation()
  const { user, cart } = useContext(Context)
  const [ verificationResult, setVerificationResult ] = useState('Loading...')

  const postCheckoutCleanup = () => {
    if (!user.isAuth) {
      localStorage.removeItem('cart')
      cart.setTotalItems(0)
    }
    setVerificationResult('Payment successful!')
  }

  const onVerificationFailed = (e) => {
    setVerificationResult('Payment failed!')
    console.error(e)
  }

  useEffect(() => {
    const sessionId = new URLSearchParams(location.search).get('session_id')
    const token = new URLSearchParams(location.search).get('token')
    if (sessionId) {
      verifyStripeCheckoutSession(sessionId).then(() => {
        postCheckoutCleanup()
      }).catch(onVerificationFailed)
    }
    if (token) {
      getPaypalOrder(token).then(() => {
        postCheckoutCleanup()
      }).catch(onVerificationFailed)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location])

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title" style={{ marginBottom: 0 }}>{verificationResult}</h2>
      </div>
    </div>
  )
})

export default PaymentSuccess
