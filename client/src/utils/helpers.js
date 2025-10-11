export const addToLocalCart = (device) => {
   const date = new Date().toISOString()
   const cart = JSON.parse(localStorage.getItem('cart'))
   if (!cart) {
    const cartObj = {
        basket: [{
            device,
            quantity: 1,
            createdAt: date
        }],
        deviceCount: 1,
        totalItems: 1,
        totalPrice: device.price
    }
    localStorage.setItem('cart', JSON.stringify(cartObj))
    return cartObj.totalItems
   } else {
    cart.totalItems++
    cart.totalPrice += device.price

    const existingItem = cart.basket.find(item => item.device.id === device.id)
    if (existingItem) {
        existingItem.quantity++
    } else {
        cart.basket.push({
            device,
            quantity: 1,
            createdAt: date
        })
        cart.deviceCount++
    }
    localStorage.setItem('cart', JSON.stringify(cart))
    return cart.totalItems
   }
}

export const getLocalCart = () => {
    const cart = localStorage.getItem('cart')
    if (cart) {
        return JSON.parse(cart)
    }
    return null
}

export const updateLocalCart = (id, newQuantity) => {
    let cart = JSON.parse(localStorage.getItem('cart'))
    const cartItem = cart.basket.find(item => item.device.id === id)
    if (cartItem) {
        if (newQuantity <= 0) {
            cart.basket = cart.basket.filter(item => item.device.id !== id)
        } else {
            cartItem.quantity = newQuantity
        }
        const deviceCount = cart.basket.length
        const totalItems = cart.basket.reduce((acc, item) => acc + item.quantity, 0)
        const totalPrice = cart.basket.reduce((acc, item) => acc + item.device.price * item.quantity, 0)

        const newCart = { basket: cart.basket, deviceCount, totalItems, totalPrice }
        localStorage.setItem('cart', JSON.stringify(newCart))
        return newCart
    }
}