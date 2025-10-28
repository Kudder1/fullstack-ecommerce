import { useLocation } from 'react-router-dom';
import './Auth.css';
import { useContext, useEffect, useState } from 'react';
import { verifyCheckoutSession } from '../http/cartAPI';
import { observer } from 'mobx-react-lite';
import { Context } from '../main';

const PaymentSuccess = observer(() => {
  const location = useLocation()
  const { user, cart } = useContext(Context)
  const [ verificationResult, setVerificationResult ] = useState('Loading...')

  useEffect(() => {
    const sessionId = new URLSearchParams(location.search).get('session_id');
    if (sessionId && !user.isAuth) {
      verifyCheckoutSession(sessionId).then(() => {
        localStorage.removeItem('cart')
        cart.setTotalItems(0)
        setVerificationResult(`Payment successful!`)
      }).catch(e => {
        setVerificationResult(`Payment failed!`)
        console.error(e)
      }) 
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
