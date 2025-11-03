import { useLocation } from 'react-router-dom';
import './Auth.css';
import { useEffect, useState } from 'react';
import { cancelOrder } from '../http/cartAPI';
import { observer } from 'mobx-react-lite';

const PaymentCancel = observer(() => {
  const location = useLocation()
  const [ cancelResult, setCancelResult ] = useState('Loading...')

  useEffect(() => {
    const stripeId = new URLSearchParams(location.search).get('session_id')
    const paypalId = new URLSearchParams(location.search).get('token')
    if (stripeId || paypalId) {
      cancelOrder({ stripeId, paypalId }
      ).then(() => {
        setCancelResult('Payment canceled')
      }).catch((e) => {
        setCancelResult('An error occurred')
        console.error(e)
    })
    }
  }, [location])

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title" style={{ marginBottom: 0 }}>{cancelResult}</h2>
      </div>
    </div>
  )
})

export default PaymentCancel
