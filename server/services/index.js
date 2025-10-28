const { Basket, BasketDevice, Order } = require("../models/models")

const mergeBaskets = async (dbBasketRaw, questCart, dbBasketId) => {
    const dbBasket = dbBasketRaw.toJSON()
    if (!dbBasket.basket_devices?.length) {
        const createPromises = questCart.basket.map(item => 
            BasketDevice.create({
                basketId: dbBasketId, 
                deviceId: item.device.id, 
                quantity: item.quantity 
            })
        )
        await Promise.all(createPromises)
    } else {
        const dbDevicesMap = new Map()
        dbBasket.basket_devices.forEach(device => {
            dbDevicesMap.set(device.deviceId, device)
        })
        const createPromises = []
        questCart.basket.forEach(item => {
            if (dbDevicesMap.has(item.device.id)) {
                createPromises.push(
                    BasketDevice.update(
                        // { quantity: sequelize.literal('quantity + ' + item.quantity) }, // This creates SQL: quantity = quantity + 5
                        { quantity: item.quantity },
                        { where: { basketId: dbBasketId, deviceId: item.device.id } }
                    )
                )
            } else {
                createPromises.push(
                    BasketDevice.create({
                        basketId: dbBasketId, 
                        deviceId: item.device.id, 
                        quantity: item.quantity 
                    })
                )
            }
        })
        await Promise.all(createPromises)
    }
}

const createCart = async (questBasket, userId) => {
    // defaults tells what values to use if we end up creating a new record
    const [basket] = await Basket.findOrCreate({
        where: { userId },
        include: [{ model: BasketDevice }],
        defaults: { userId },
    })
    if (questBasket) {
        await mergeBaskets(basket, questBasket, basket.id)
    }
}
const syncOrders = async (guestToken, user) => {
    const whereClause = guestToken ? { guestToken, userId: null } : { email: user.email, userId: null }
    await Order.update({ userId: user.id }, { where: whereClause })
}
const runAllServices = async (questBasket, guestToken, user) => {
    await Promise.all([
        createCart(questBasket, user.id),
        syncOrders(guestToken, user)
    ])
}

module.exports = { createCart, syncOrders, runAllServices }