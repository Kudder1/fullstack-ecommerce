import { useState } from 'react';
import './Auth.css';
import { verifyEmail } from '../http/userAPI';
import { useEffect } from 'react';

const Confirmation = () => {
  const [confirmationResult, setConfirmationResult] = useState('Confirming...');

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const token = urlParams.get('token')
    if (token) {
      verifyEmail(token)
        .then(res => {
          setConfirmationResult(res.message);
        }).catch(err => {
          setConfirmationResult(err.message || 'Verification failed');
        })
    }
  }, [])

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">{confirmationResult}</h2>
      </div>
    </div>
  );
}

export default Confirmation;
