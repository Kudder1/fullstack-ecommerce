import { useEffect, useContext } from 'react';
import './Basket.css';
import { Context } from '../main';
import { createCheckout, getCart, updateCart } from '../http/cartAPI';
import { observer } from 'mobx-react-lite';
import { getLocalCart, updateLocalCart } from '../utils/helpers';

const formatPrice = (price) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(price);
}

export const Basket = observer(() => {
  const { user, cart } = useContext(Context);

  const updateCartState = (data) => {
    cart.setCartItems(data.basket);
    cart.setTotalItems(data.totalItems);
    cart.setTotalPrice(data.totalPrice);
    cart.setDeviceCount(data.deviceCount);
  };

  async function handleCheckout() {
    const cartItems = cart.cartItems.map(item => ({
      id: item.device.id,
      quantity: item.quantity
    }))
    const data = await createCheckout(cartItems)
    window.location.href = data.url
  }

  useEffect(() => {
    if (user.isAuth) {
      getCart().then(data => {
        updateCartState(data)
      })
    } else {
      const localCart = getLocalCart()
      if (localCart) updateCartState(localCart)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateQuantity = async (id, newQuantity) => {
    let data
    if (user.isAuth) {
      data = await updateCart(id, newQuantity);
    } else {
      data = updateLocalCart(id, newQuantity);
    }
    updateCartState(data);
  };

  const removeItem = async (id) => {
    let data
    if (user.isAuth) {
      data = await updateCart(id, 0);
    } else {
      data = updateLocalCart(id, 0);
    }
    updateCartState(data);
  };

  if (cart.cartItems.length === 0) {
    return (
      <div className="container">
        <div className="empty-cart">
          <div className="empty-cart-icon">🛒</div>
          <h2>Ваша корзина пуста</h2>
          <p>Добавьте товары в корзину, чтобы оформить заказ</p>
          <button className="btn btn-primary">
            Перейти к покупкам
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="basket-page">
        <div className="row">
          <div className="col-lg-8">
            <div className="cart-section">
              <div className="cart-header">
                <h2>Корзина</h2>
                {/* <button 
                  className="btn btn-link text-danger"
                  onClick={onClearCart}
                >
                  Очистить корзину
                </button> */}
              </div>

              <div className="cart-items">
                {cart.cartItems.map((item) => (
                  <div key={item.device.id} className="cart-item">
                    <div className="item-image">
                      <img src={import.meta.env.VITE_SERVER_URL + item.device.img} alt={item.device.name} />
                      {/* {!item.device.inStock && (
                        <div className="out-of-stock-badge">Нет в наличии</div>
                      )} */}
                    </div>

                    <div className="item-details">
                      <h4 className="item-name">{item.device.name}</h4>
                      <p className="item-brand">{item.device.brand?.name}</p>
                      {/* {!item.device.inStock && (
                        <p className="text-danger">Товар временно недоступен</p>
                      )} */}
                    </div>

                    <div className="item-quantity">
                      <label>Количество:</label>
                      <div className="quantity-controls">
                        <button
                          className="btn btn-outline-secondary btn-sm"
                          onClick={() => updateQuantity(item.device.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          −
                        </button>
                        <input
                          type="number"
                          className="form-control quantity-input"
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.device.id, parseInt(e.target.value) || 1)}
                          min="1"
                          max="99"
                        />
                        <button
                          className="btn btn-outline-secondary btn-sm"
                          onClick={() => updateQuantity(item.device.id, item.quantity + 1)}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="item-price">
                      <div className="price-per-item">
                        {formatPrice(item.device.price)}
                      </div>
                      {item.quantity > 1 && (
                        <div className="total-per-item">
                          Итого: {formatPrice(item.device.price * item.quantity)}
                        </div>
                      )}
                    </div>

                    <div className="item-actions">
                      <button
                        className="btn btn-link text-danger"
                        onClick={() => removeItem(item.device.id)}
                        title="Удалить товар"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="col-lg-4">
            <div className="order-summary">
              <h3>Итого по заказу</h3>
              
              <div className="summary-line">
                <span>Товары ({cart.totalItems} шт.)</span>
                <span>{formatPrice(cart.totalPrice)}</span>
              </div>
              
              <div className="summary-total">
                <span>К оплате</span>
                <span>{formatPrice(cart.totalPrice)}</span>
              </div>

              <button onClick={handleCheckout} className="btn btn-success btn-lg checkout-btn">
                Proceed to checkout
              </button>

              <div className="payment-methods">
                <h5>Способы оплаты:</h5>
                <div className="payment-icons">
                  <span className="payment-icon">💳</span>
                  <span className="payment-icon">🏪</span>
                  <span className="payment-icon">📱</span>
                </div>
              </div>

              <div className="security-notice">
                🔒 Безопасная оплата
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
})

export default Basket;
