import { useState } from 'react';
import './Auth.css';
import { newPassword } from '../http/userAPI';
import { observer } from 'mobx-react-lite';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { Context } from '../main';
import { SHOP_ROUTE } from '../utils/constants';

const NewPassword = observer(() => {
  const { user } = useContext(Context)
  const navigate = useNavigate()

  const [password1, setPassword1] = useState();
  const [password2, setPassword2] = useState();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const urlParams = new URLSearchParams(window.location.search)
      const token = urlParams.get('token')
      const data = await newPassword(password1, password2, token);
      user.setUser(data.user)
      user.setIsAuth(true)
      alert(data.message);
      navigate(SHOP_ROUTE)
    } catch (err) {
      alert(err.message);
    }
  }


  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Update Password</h2>
        <form className="auth-form" onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="Enter new password..."
            value={password1}
            onChange={(e) => setPassword1(e.target.value)}
            className="auth-input"
            required
          />
          <input
            type="password"
            placeholder="Repeat new password..."
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
            className="auth-input"
            required
          />
          <button>Save</button>
        </form>
      </div>
    </div>
  );
})

export default NewPassword;
