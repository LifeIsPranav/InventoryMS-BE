/**
 * Storage Management
 * 
 * GET    /api/v1/storages/                    Get all storage locations
 * POST   /api/v1/storages/                    Create new storage location
 * GET    /api/v1/storages/:id                 Get single storage location
 * PUT    /api/v1/storages/:id                 Update storage location details
 * DELETE /api/v1/storages/:id                 (Admin) Delete storage location
 * POST   /api/v1/storages/:id/products        Add product to storage
 * DELETE /api/v1/storages/:id/products        Remove product from storage
 * GET    /api/v1/storages/:id/utilization     Get storage utilization (capacity, volume, cost)
 * GET    /api/v1/storages/:id/cost-summary    Get storage cost summary and breakdown
 */

const express = require('express')

const { storageController } = require('../../controllers')
const authMiddleware = require('../../middlewares/auth.middleware')
const adminMiddleware = require('../../middlewares/auth.admin.middleware')
const validator = require('../../validators/zod.validator')
const { storageDto } = require('../../dto')

const storageRouter = express.Router()

storageRouter.get('/', storageController.getAllStorages)
storageRouter.post('/', authMiddleware, validator(storageDto.createStorageSchema), storageController.createStorageLocation)
storageRouter.post('/:id/products', authMiddleware, validator(storageDto.addProductSchema), storageController.addProductToStorage)
storageRouter.delete('/:id/products', authMiddleware, validator(storageDto.removeProductSchema), storageController.removeProductFromStorage)
storageRouter.get('/:id/utilization', authMiddleware, storageController.getStorageUtilization)
storageRouter.get('/:id/cost-summary', authMiddleware, storageController.getStorageCostSummary)
storageRouter.get('/:id', storageController.getStorage)
storageRouter.put('/:id', authMiddleware, validator(storageDto.updateStorageSchema), storageController.updateStorage)
storageRouter.delete('/:id', adminMiddleware, storageController.deleteStorage)

module.exports = storageRouter
