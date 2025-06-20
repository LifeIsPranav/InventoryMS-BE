/**
 * Inventory Management
 * 
 * GET    /api/v1/inventory/                   Get all inventory items
 * POST   /api/v1/inventory/create             (Admin) Add new inventory item
 * GET    /api/v1/inventory/:id                Get single inventory item
 * PUT    /api/v1/inventory/:id                (Admin) Update inventory details
 * DELETE /api/v1/inventory/:id                (Admin) Delete inventory
 * POST   /api/v1/inventory/:id/products       Add product to inventory (with optional storage)
 * GET    /api/v1/inventory/:id/products       Get all products in inventory
 * DELETE /api/v1/inventory/:id/products       Remove product from inventory
 * POST   /api/v1/inventory/:id/storage        Add storage to inventory
 * DELETE /api/v1/inventory/:id/storage        Remove storage from inventory
 * GET    /api/v1/inventory/:id/utilization    Get inventory capacity utilization (weight, volume, cost)
 * GET    /api/v1/inventory/:id/cost-summary   Get inventory cost summary and breakdown
 * 
*/

const express = require('express')

const adminMiddleware = require('../../middlewares/auth.admin.middleware')
const validator = require('../../validators/zod.validator')
const { inventoryController } = require('../../controllers')
const { inventoryDto } = require('../../dto')
const authMiddleware = require('../../middlewares/auth.middleware')

const inventoryRouter = express.Router()

inventoryRouter.get('/', inventoryController.getAllInventories)
inventoryRouter.get('/:id', inventoryController.getInventory)
inventoryRouter.post('/create', adminMiddleware, validator(inventoryDto.createInventorySchema), inventoryController.createInventory)
inventoryRouter.put('/:id', adminMiddleware, validator(inventoryDto.updateInventorySchema), inventoryController.updateInventory)
inventoryRouter.delete('/:id', adminMiddleware, inventoryController.deleteInventory)
inventoryRouter.post('/:id/products', authMiddleware, validator(inventoryDto.addProductToInventorySchema), inventoryController.addProductToInventory)
inventoryRouter.get('/:id/products', inventoryController.getAllProductsInInventory)
inventoryRouter.delete('/:id/products', authMiddleware, validator(inventoryDto.removeProductFromInventorySchema), inventoryController.removeProductFromInventory)
inventoryRouter.post('/:id/storage', authMiddleware, validator(inventoryDto.addStorageToInventorySchema), inventoryController.addStorageToInventory)
inventoryRouter.delete('/:id/storage', authMiddleware, validator(inventoryDto.addStorageToInventorySchema), inventoryController.removeStorageFromInventory)
inventoryRouter.get('/:id/utilization', inventoryController.getInventoryCapacityUtilization)
inventoryRouter.get('/:id/cost-summary', inventoryController.getInventoryCostSummary)

module.exports = inventoryRouter