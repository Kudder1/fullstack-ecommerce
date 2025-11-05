const sequelize = require('../db')
const { DataTypes } = require('sequelize')

const User = sequelize.define('user', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
    },
    role: {
        type: DataTypes.STRING,
        defaultValue: 'USER'
    },
    googleId: {
        type: DataTypes.STRING,
        unique: true
    },
    emailVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    emailVerificationId: {
        type: DataTypes.STRING,
        unique: true
    },
    emailVerificationIdExpireDate: {
        type: DataTypes.DATE,
    },
    passwordResetId: {
        type: DataTypes.STRING,
        unique: true
    },
    passwordResetIdExpireDate: {
        type: DataTypes.DATE,
    }
})

const Basket = sequelize.define('basket', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
}, {
    indexes: [
        {
            fields: ['userId']
        }
    ]
})

const BasketDevice = sequelize.define('basket_device', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
    }
}, {
    indexes: [
        {
            fields: ['basketId']
        },
        {
            fields: ['deviceId']
        },
        {
            unique: true,
            fields: ['basketId', 'deviceId']
        }
    ]
})

const Device = sequelize.define('device', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        unique: true, 
        allowNull: false
    },
    price: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    averageRating: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    img: {
        type: DataTypes.STRING,
        allowNull: false
    }
})

const Type = sequelize.define('type', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    }
})

const Brand = sequelize.define('brand', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    }
})

const Rating = sequelize.define('rating', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    rate: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
            max: 5
        }
    },
}, {
  indexes: [
    {
      unique: true,
      fields: ['userId', 'deviceId']
    }
  ]
})

const DeviceInfo = sequelize.define('device_info', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.STRING,
        allowNull: false
    }
})

const TypeBrand = sequelize.define('type_brand', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    }
})

// Orders

const Order = sequelize.define('order', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    stripeSessionId: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: true
    },
    stripePaymentIntentId: {
        type: DataTypes.STRING,
        allowNull: true
    },
    paypalOrderId: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: true
    },
    paypalCaptureId: {
        type: DataTypes.STRING,
        allowNull: true
    },
    amount: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    currency: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'usd'
    },
    status: {
        type: DataTypes.ENUM('pending', 'paid', 'cancelled'),
        defaultValue: 'pending'
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true
    },
    guestToken: {
        type: DataTypes.STRING,
        allowNull: true
    },
    shippingName: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    shippingCity: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    shippingCountry: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    shippingLine1: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    shippingLine2: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    shippingPostalCode: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    shippingState: {
        type: DataTypes.STRING,
        allowNull: true,
    },
})

const OrderItem = sequelize.define('order_item', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    price: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
    }
})

User.hasMany(Order)
Order.belongsTo(User)

Order.hasMany(OrderItem, { onDelete: 'CASCADE' })
OrderItem.belongsTo(Order)

Device.hasMany(OrderItem)
OrderItem.belongsTo(Device)


User.hasOne(Basket)
Basket.belongsTo(User)

User.hasMany(Rating)
Rating.belongsTo(User)

Basket.hasMany(BasketDevice)
BasketDevice.belongsTo(Basket)

Type.hasMany(Device)
Device.belongsTo(Type)

Brand.hasMany(Device)
Device.belongsTo(Brand)

Device.hasMany(Rating)
Rating.belongsTo(Device)

Device.hasMany(BasketDevice)
BasketDevice.belongsTo(Device)

Device.hasMany(DeviceInfo, { as: 'info' })
DeviceInfo.belongsTo(Device)

Type.belongsToMany(Brand, { through: TypeBrand })
Brand.belongsToMany(Type, { through: TypeBrand })

module.exports = {
  User,
  Basket,
  BasketDevice,
  Device,
  DeviceInfo,
  Type,
  Brand,
  Rating,
  TypeBrand,
  Order,
  OrderItem
}
