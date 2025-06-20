// All routes According to HLD at one Place:
/**
 * User Management
 * 
 * POST   /api/v1/users/register         Register a new user
 * POST   /api/v1/users/login            Login & get JWT token
 * POST   /api/v1/users/logout           Logout a user
 * GET    /api/v1/users/me               Get current user info
 * GET    /api/v1/users/                 List all users
 * PUT    /api/v1/users/                 Update user's profile
 * PUT    /api/v1/users/update_password  Update password
 * PUT    /api/v1/users/:id              (Admin) Update user role/shift
 * DELETE /api/v1/users/:id              (Admin) Delete a user
 * 
 * 
 * Inventory Management
 * 
 * GET    /api/v1/inventory/          Get all inventory items
 * POST   /api/v1/inventory/          Add new inventory item
 * GET    /api/v1/inventory/:id       Get single inventory item
 * PUT    /api/v1/inventory/:id       Update item details
 * DELETE /api/v1/inventory/:id       Delete item
 * GET    /api/v1/inventory/low       Get items low on stock
 * POST   /api/v1/inventory/restock   Auto-restock suggestion
 * GET    /api/v1/inventory/heatmap   Location-wise distribution data
 * 
 * 
 * Transportation Management
 * 
 * GET    /api/v1/deliveries/         Get all deliveries
 * POST   /api/v1/deliveries/         Create a new transportation
 * GET    /api/v1/deliveries/:id      Get transportation status
 * PUT    /api/v1/deliveries/:id      Update transportation status/location
 * POST   /api/v1/deliveries/assign   Assign transportation to personnel
 * GET    /api/v1/deliveries/eta      Get predicted ETA
 * 
 * 
 * Wage & Workforce Management
 * 
 * GET    /api/v1/wages/              List wage entries
 * POST   /api/v1/wages/calculate     Calculate wages for all employees
 * GET    /api/v1/wages/overworked    Get list of overworked employees
 * PUT    /api/v1/wages/:userId       Update wage info
 * 
 * 
 * Alerts & Notifications
 * 
 * GET    /api/v1/alerts/             Get all active alerts
 * POST   /api/v1/alerts/trigger      Manually trigger an alert (for testing)
 * POST   /api/v1/alerts/send         Send alert to subscribed users
 * 
 * 
 * Admin & Misc -> unsure of now..
 * 
 * GET    /api/v1/admin/metrics       Return analytics/reporting data
 * GET    /api/v1/admin/roles         View all user roles (staff, supplier)
 * PUT    /api/v1/admin/layout        Update warehouse layout config
 */

const express = require('express')

const userRouter = require('./user.routes')
const inventoryRouter = require('./inventory.routes')
const transportationRouter = require('./transportation.routes')
const wageRouter = require('./wage.router')
const alertRouter = require('./alert.router')
const productRouter = require('./product.routes')
const storageRouter = require('./storage.router')
const orderRouter = require('./order.routes')

const v1Router = express.Router()

v1Router.use('/users', userRouter)
v1Router.use('/products', productRouter)
v1Router.use('/inventory', inventoryRouter)
v1Router.use('/transports', transportationRouter)
v1Router.use('/wages', wageRouter)
v1Router.use('/alerts', alertRouter)
v1Router.use('/storages', storageRouter)
v1Router.use('/buy', orderRouter)

module.exports = v1Router
