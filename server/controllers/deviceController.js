const path = require('path')
const { randomUUID } = require('crypto');
const { Device, DeviceInfo, Brand } = require('../models/models')
const ApiError = require('../error/ApiError');
const { uploadFile, getPresignedUploadUrl } = require('../s3');

class DeviceController {
    async create(req, res, next) {
        try {
            const { name, price, brandId, typeId, imageUrl } = req.body
            let { info } = req.body

            let device
            
            // Check if this is a direct upload (with imageUrl) or server upload (with file)
            if (imageUrl) {
                // Direct upload method - create device with provided imageUrl
                device = await Device.create({
                    name,
                    price,
                    brandId,
                    typeId,
                    img: imageUrl
                })
            } else if (req.files && req.files.image) {
                // Server upload method - your existing logic
                const { image } = req.files
                let fileName = randomUUID() + ".jpg"
                const filePath = path.resolve(__dirname, '..', 'static', fileName)
                await image.mv(filePath)

                device = await Device.create({
                    name,
                    price,
                    brandId,
                    typeId,
                    img: 'temp'
                })

                const uploadedImageUrl = await uploadFile(image.data, fileName, image.mimetype)
                await device.update({ img: uploadedImageUrl })
            } else {
                throw new Error('Either imageUrl or image file is required')
            }
        
            if (info) {
                info = JSON.parse(info)
                info.forEach(i => {
                    DeviceInfo.create({
                        title: i.title,
                        description: i.description,
                        deviceId: device.id
                    })
                })
            }
            return res.json(device)
        } catch (e) {
            console.log(e)
            next(ApiError.badRequest(e.message))
        }
    }
    async getAll(req, res) {
        let { brandId, typeId, limit, page } = req.query
        page = page || 1
        limit = limit || 9
        let offset = page * limit - limit
        const where = {}
        if (brandId) where.brandId = brandId
        if (typeId) where.typeId = typeId

        const devices = await Device.findAndCountAll({
            where,
            limit,
            offset,
            include: [{ model: Brand }],
            order: [['createdAt', 'ASC']]
        })
        return res.json(devices)
    }
    async getOne(req, res) {
        const { id } = req.params
        const device = await Device.findOne({
            where: { id },
            include: [
                { model: DeviceInfo, as: 'info' },
                { model: Brand }
            ]
        })
        return res.json(device)
    }
    // If I'm to remove the image, I'm gonna need to invalidate the CloudFront cache too, otherwise it will stay for 24h
    // I will also need to add a policy to CloudFront to allow invalidation
    // https://www.youtube.com/watch?v=lZAGIy1e3JA

    async update(req, res, next) {
        try {
            const { id } = req.params
            const updateData = req.body
            
            const device = await Device.findByPk(id)
            //Model.findByPk(1) is equivalent to Model.findOne({primaryKey: 1})
            if (!device) {
                return next(ApiError.badRequest('Device not found'))
            }
            
            await device.update(updateData)
            return res.json(device)
        } catch (e) {
            console.log(e)
            next(ApiError.badRequest(e.message))
        }
    }
    async getUploadUrl(req, res, next) {
        try {
            const { fileName, contentType } = req.body
            const presignedData = await getPresignedUploadUrl(fileName, contentType)
            
            // Return presigned data + the final permanent URL
            return res.json({
                ...presignedData,
                finalUrl: `https://${process.env.S3_BUCKET}.s3.${process.env.S3_BUCKET_REGION}.amazonaws.com/${fileName}`
            })
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }
}

module.exports = new DeviceController()