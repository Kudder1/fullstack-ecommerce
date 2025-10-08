const { Rating, Device } = require("../models/models")

class RatingController {
    async addRating(req, res) {
        const { rate, deviceId } = req.body
        const { id: userId } = req.user

        let rating = await Rating.findOne({ where: { userId, deviceId } })
        if (!rating) {
            rating = await Rating.create({ deviceId, userId, rate })
        }
        rating.rate = rate
        await rating.save()

        const device = await Device.findOne({ where: { id: deviceId }, include: [{ model: Rating }] })
        const averageRating = device.ratings.reduce((acc, curr) => acc + curr.rate, 0) / device.ratings.length
        device.averageRating = averageRating
        await device.save()

        return res.json(rating)
    }
    async getAllUsersRatedDevices(req, res) {
        const { id: userId } = req.user
        const ratings = await Rating.findAll({ where: { userId }, include: [{ model: Device }] })
        return res.json(ratings)
    }
    async deleteDeviceRating(req, res) {
        let rateId = +req.params.rateId
        const rating = await Rating.findOne({
            where: { id: rateId },
            include: [{
                model: Device,
                include: [{ model: Rating }]
            }]
        })

        const { remainingRatingsSum, count } = rating.device.ratings.reduce((acc, el) => {
            if (el.id !== rateId) {
                acc.remainingRatingsSum += el.rate;
                acc.count++;
            }
            return acc
        }, { remainingRatingsSum: 0, count: 0 })

        rating.device.averageRating = count === 0 ? 0 : remainingRatingsSum / count
       
        await rating.device.save()
        await rating.destroy()
        
        const plainRating = rating.toJSON()
        delete plainRating.device
        res.json(plainRating)
    }
}

module.exports = new RatingController()