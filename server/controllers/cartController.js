const ApiError = require("../error/ApiError")
const { Basket, BasketDevice, Device } = require("../models/models")

// [{
//    id
//    quantity
//    updatedAt
//    basketId
//    deviceId
// }]

async function mergeBaskets(dbBasket, questBasket) {
    // compare timestamp of each duplicate item (same id)
    // questTimestamp needs to be validated
    // apply merge strategy
    // insert/update basket_devices
    return dbBasket
}

function getBasketTotals(basket) {
    const itemCount = basket.length
    const totalItems = basket.reduce((acc, item) => acc + item.quantity, 0)
    const totalPrice = basket.reduce((acc, item) => acc + item.device.price * item.quantity, 0)
    return { basket, itemCount, totalItems, totalPrice }
}

class CartController {
    // basket should be created on user login as a separate request
    async create(req, res) {
        const { questBasket } = req.body
        const { id: userId } = req.user
        let basket = await Basket.findOne({ where: { userId } })
        if (questBasket) {
            if (!basket) {
                basket = await Basket.create({ userId })
            }
            mergeBaskets(basket, questBasket)
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
                    model: Device
                }]
            }]
        })
        return res.json(getBasketTotals(basket.basket_devices))
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