const ApiError = require("../error/ApiError")
const { Basket, BasketDevice, Device, Brand } = require("../models/models")

async function mergeBaskets(dbBasketRaw, questCart, dbBasketId) {
    const dbBasket = dbBasketRaw.toJSON()
    if (!dbBasket.basket_devices.length) {
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
            if (dbDevicesMap.has(item.deviceId)) {
                createPromises.push(
                    BasketDevice.update(
                        // { quantity: sequelize.literal('quantity + ' + item.quantity) }, // This creates SQL: quantity = quantity + 5
                        { quantity: item.quantity },
                        { where: { basketId: dbBasketId, deviceId: item.deviceId } }
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

function getBasketTotals(basket) {
    const deviceCount = basket.length
    const totalItems = basket.reduce((acc, item) => acc + item.quantity, 0)
    const totalPrice = basket.reduce((acc, item) => acc + item.device.price * item.quantity, 0)
    return { basket, deviceCount, totalItems, totalPrice }
}

class CartController {
    async create(req, res) {
        const { questBasket } = req.body
        const { id: userId } = req.user
        let basket = await Basket.findOne({ where: { userId }, include: [{ model: BasketDevice }] })
        if (questBasket) {
            if (!basket) {
                basket = await Basket.create({ userId })
            }
            await mergeBaskets(basket, questBasket, basket.id)
            return res.json(basket)
        }
        if (!basket) {
            basket = await Basket.create({ userId })
        }
        return res.json(basket)
    } 
    async get(req, res) {
        const { id: userId } = req.user
        const basket = await Basket.findOne({
            where: { userId },
            include: [{
                model: BasketDevice,
                include: [{
                    model: Device,
                    include: [{
                        model: Brand
                    }]
                }]
            }]
        })
        const basketDevices = basket ? basket.basket_devices : []
        return res.json(getBasketTotals(basketDevices))
    }
    async add(req, res, next) {
        const { id: userId } = req.user
        const { deviceId, quantity } = req.body

        let device = await Device.findOne({ where: { id: deviceId } })
        if (!device) {
            return next(ApiError.notFound('Device not found'))
        }

        let basket = await Basket.findOne({ where: { userId } })
        if (!basket) {
            basket = await Basket.create({ userId })
        }

        let basketDevice = await BasketDevice.findOne({ where: { basketId: basket.id, deviceId } })
        if (!basketDevice) {
            basketDevice = await BasketDevice.create({ basketId: basket.id, deviceId, quantity })
        } else {
            basketDevice.quantity += quantity
            await basketDevice.save()
        }
        
        const fullBasket = await BasketDevice.findAll({ where: { basketId: basket.id }, include: [{ model: Device }] })
        return res.json(getBasketTotals(fullBasket))
    }
    async update(req, res) {
        const { id: userId } = req.user
        const { deviceId, quantity } = req.body

        let device = await Device.findOne({ where: { id: deviceId } })
        if (!device) {
            return next(ApiError.notFound('Device not found'))
        }

        const basket = await Basket.findOne({ where: { userId } })
        const basketDevice = await BasketDevice.findOne({ where: { basketId: basket.id, deviceId } })

        if (quantity <= 0) {
            await basketDevice.destroy()
        } else {
            basketDevice.quantity = quantity
            await basketDevice.save()
        }

        const fullBasket = await BasketDevice.findAll({ where: { basketId: basket.id }, include: [{ model: Device }] })
        return res.json(getBasketTotals(fullBasket))
    }
}

module.exports = new CartController()