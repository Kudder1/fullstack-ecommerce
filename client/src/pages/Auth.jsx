import { useContext, useState } from 'react';
import './Auth.css';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { LOGIN_ROUTE, REGISTRATION_ROUTE, SHOP_ROUTE } from '../utils/constants'
import { registration, login } from '../http/userAPI';
import { observer } from 'mobx-react-lite';
import { Context } from '../main';

const Auth = observer(() => {
  const { user } = useContext(Context)
  const location = useLocation()
  const navigate = useNavigate()
  const isLogin = location.pathname === LOGIN_ROUTE
 
  const [email, setEmail] = useState('test@test.com');
  const [password, setPassword] = useState('test@test.com');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let data
      if (isLogin) {
        data = await login(email, password)
      } else {
        data = await registration(email, password)
      }
      user.setUser(data)
      user.setIsAuth(true)
      navigate(SHOP_ROUTE)
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">{isLogin ? 'Авторизация' : 'Регистрация'}</h2>
        
        <form className="auth-form" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Введите ваш email..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="auth-input"
            required
          />
          <input
            type="password"
            placeholder="Введите ваш пароль..."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="auth-input"
            required
          />
          
          <div className="auth-footer">
            {!isLogin ? (
              <p className="auth-text">
                Есть аккаунт?
                <NavLink to={LOGIN_ROUTE} className="auth-link"> Войти</NavLink>
              </p>
            ) : (
              <p className="auth-text">
                Нет аккаунта?
                <NavLink to={REGISTRATION_ROUTE} className="auth-link"> Зарегистрируйся</NavLink>
                </p>
            )}
          </div>
          <button>{isLogin ? "Войти" : "Регистрация"}</button>
        </form>
      </div>
    </div>
  );
})

export default Auth;
