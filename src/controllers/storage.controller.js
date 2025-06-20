const { StatusCodes } = require('http-status-codes')
const { StorageService } = require('../services')
const { StorageRepository, ProductRepository } = require('../repositories')
const logger = require('../utils/logger')
const ApiResponse = require('../dto/response.dto')

const CONTEXT = 'StorageController'

const storageService = new StorageService(new StorageRepository(), new ProductRepository())

const createStorageLocation = async (req, res) => {
  logger.info(`[${CONTEXT}] Creating new storage location with data: ${JSON.stringify(req.body)}`)
  const storage = await storageService.createStorageLocation(req.body)
  res.status(StatusCodes.CREATED).json(ApiResponse.success('Storage location created successfully', { storage }))
  logger.info(`[${CONTEXT}] Storage location created successfully: ${storage._id}`)
}

const getStorage = async (req, res) => {
  const identifier = req.params.id.match(/^[0-9a-fA-F]{24}$/) ? { storageId: req.params.id } : { locationId: req.params.id }
  logger.info(`[${CONTEXT}] Fetching storage with identifier: ${JSON.stringify(identifier)}`)
  const storage = await storageService.getStorage(identifier)
  res.status(StatusCodes.OK).json(ApiResponse.success('Storage location fetched successfully', { storage }))
  logger.info(`[${CONTEXT}] Storage location fetched successfully: ${storage._id}`)
}

const getAllStorages = async (req, res) => {
  logger.info(`[${CONTEXT}] Fetching all storage locations`)
  const storages = await storageService.getAllStorages()
  res.status(StatusCodes.OK).json(ApiResponse.success('All storage locations fetched successfully', { length: storages.length, storages }))
  logger.info(`[${CONTEXT}] All storage locations fetched successfully. Total: ${storages.length}`)
}

const updateStorage = async (req, res) => {
  logger.info(`[${CONTEXT}] Updating storage location ID: ${req.params.id} with data: ${JSON.stringify(req.body)}`)
  const updatedStorage = await storageService.updateStorage(req.params.id, req.body)
  res.status(StatusCodes.OK).json(ApiResponse.success('Storage location updated successfully', { storage: updatedStorage }))
  logger.info(`[${CONTEXT}] Storage location updated successfully: ${updatedStorage._id}`)
}

const deleteStorage = async (req, res) => {
  logger.info(`[${CONTEXT}] Deleting storage location ID: ${req.params.id}`)
  const deletedStorage = await storageService.deleteStorage(req.params.id)
  res.status(StatusCodes.OK).json(ApiResponse.success('Storage location deleted successfully', { storage: deletedStorage }))
  logger.info(`[${CONTEXT}] Storage location deleted successfully: ${deletedStorage._id}`)
}

const addProductToStorage = async (req, res) => {
    const quantity = req.body.quantity || 1
    logger.info(`[${CONTEXT}] Adding ${quantity} pieces of product ${req.body.productId} to storage ${req.params.id}`)
    const storage = await storageService.addProductToStorage(req.params.id, req.body.productId, quantity)
    res.status(StatusCodes.OK).json(ApiResponse.success('Product added to storage successfully', { storage }))
    logger.info(`[${CONTEXT}] Product added to storage successfully.`)
}

const removeProductFromStorage = async (req, res) => {
    const quantity = req.body.quantity || 1
    logger.info(`[${CONTEXT}] Removing ${quantity} pieces of product ${req.body.productId} from storage ${req.params.id}`)
    const storage = await storageService.removeProductFromStorage(req.params.id, req.body.productId, quantity)
    res.status(StatusCodes.OK).json(ApiResponse.success('Product removed from storage successfully', { storage }))
    logger.info(`[${CONTEXT}] Product removed from storage successfully.`)
}

const getStorageUtilization = async (req, res) => {
    logger.info(`[${CONTEXT}] Getting utilization for storage ${req.params.id}`)
    const utilization = await storageService.getStorageUtilization(req.params.id)
    res.status(StatusCodes.OK).json(ApiResponse.success('Storage utilization fetched successfully', { utilization }))
    logger.info(`[${CONTEXT}] Storage utilization fetched successfully.`)
}

const getStorageCostSummary = async (req, res) => {
    logger.info(`[${CONTEXT}] Getting cost summary for storage ${req.params.id}`)
    const costSummary = await storageService.getStorageCostSummary(req.params.id)
    res.status(StatusCodes.OK).json(ApiResponse.success('Storage cost summary fetched successfully', costSummary))
    logger.info(`[${CONTEXT}] Storage cost summary fetched successfully.`)
}

module.exports = {
  createStorageLocation,
  getStorage,
  getAllStorages,
  updateStorage,
  deleteStorage,
  addProductToStorage,
  removeProductFromStorage,
  getStorageUtilization,
  getStorageCostSummary
}
