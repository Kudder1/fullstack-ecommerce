import { useState } from 'react';
import './Auth.css';
import { recoverPassword } from '../http/userAPI';

const PasswordRecovery = () => {
  const [email, setEmail] = useState()

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await recoverPassword(email)
      alert(res.message)
    } catch (err) {
      alert(err.message);
    }
  }


  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Reset Password</h2>
        <form className="auth-form" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Enter your email..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="auth-input"
            required
          />
          <button>Reset</button>
        </form>
      </div>
    </div>
  );
}

export default PasswordRecovery;
