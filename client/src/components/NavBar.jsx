import { NavLink } from 'react-router-dom';
import './NavBar.css';
import { ADMIN_ROUTE, LOGIN_ROUTE, SHOP_ROUTE, BASKET_ROUTE } from '../utils/constants';
import { Context } from '../main';
import { useContext, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { getCart } from '../http/cartAPI';
import { useLocation } from 'react-router-dom';

const NavBar = observer(() => {
    const { user, cart } = useContext(Context)
    const { pathname } = useLocation();

    useEffect(() => {
        if (pathname !== BASKET_ROUTE) {
            getCart().then(data => {
                cart.setTotalItems(data.totalItems)
            });
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    
    const logOut = () => {
        localStorage.removeItem('token')
        user.setUser({})
        user.setIsAuth(false)
    }

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <div className="navbar-brand">
                    <NavLink to={SHOP_ROUTE} className="navbar-brand">Brand</NavLink>
                </div>
                <ul className="navbar-nav">
                    <li className="nav-item">
                        <NavLink to={BASKET_ROUTE} className="nav-link cart-link">
                            <span className="cart-icon">🛒</span>
                            {cart.totalItems > 0 && (
                                <span className="cart-badge">{cart.totalItems}</span>
                            )}
                        </NavLink>
                    </li>
                    {user.isAuth ? (
                        <>
                            <li className="nav-item">
                                <NavLink to={ADMIN_ROUTE} className="nav-link">Admin</NavLink>
                            </li>
                            <li className="nav-item">
                                <button onClick={logOut} className="nav-link">Logout</button>
                            </li>
                        </>
                    ) : (
                        <>
                            <li className="nav-item">
                                <NavLink to={LOGIN_ROUTE} className="nav-link">Login</NavLink>
                            </li>
                        </>
                    )}
                </ul>
            </div>
        </nav>
    );
})

export default NavBar;