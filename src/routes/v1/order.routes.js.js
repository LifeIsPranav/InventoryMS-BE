/**
 * Order Management
 * 
 * POST   /api/v1/buy/order           Create a new order
 * PUT    /api/v1/buy/order           Update an existing order
 * 
 */

const express = require('express')

const { transportationController } = require('../../controllers')
const validator = require('../../validators/zod.validator')
const { orderDto } = require('../../dto')
const { authMiddleware } = require('../../middlewares')

const orderRouter = express.Router()

orderRouter.post('/order', authMiddleware, validator(orderDto.createOrder), transportationController.createTransportation)
orderRouter.put('/order', authMiddleware, validator(orderDto.updateOrder), transportationController.updateTransportation)

module.exports = orderRouter