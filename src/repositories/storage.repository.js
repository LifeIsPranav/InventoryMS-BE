const logger = require('../utils/logger')
const { Storage } = require('../models')
const { BadRequestError } = require('../errors/client.error')

const CONTEXT = 'StorageRepository'

class StorageRepository {
  async createStorageLocation(storageDetails) {
    try {
      logger.info(`[${CONTEXT}] Creating storage with locationId: ${storageDetails.locationId}`)
      const storage = await Storage.create(storageDetails)

      logger.info(`[${CONTEXT}] Storage created successfully: ${storage._id}`)
      return storage

    } catch (error) {
      logger.error(`[${CONTEXT}][createStorage] :: ${error.message}`, error)
      throw new BadRequestError('Storage with this locationId already exists.')
    }
  }

  async getStorageById(storageId) {
    logger.info(`[${CONTEXT}] Fetching storage by ID: ${storageId}`)
    return await Storage.findById(storageId).populate('products')
  }

  async getStorageByLocationId(locationId) {
    logger.info(`[${CONTEXT}] Fetching storage by locationId: ${locationId}`)
    return await Storage.findOne({ locationId }).populate('products')
  }

  async getAllStorages() {
    logger.info(`[${CONTEXT}] Fetching all storages`)
    return await Storage.find().populate('products')
  }

  async updateStorage(storageId, storageDetails) {
    try {
      logger.info(`[${CONTEXT}] Updating storage: ${storageId}`)
      const updatedStorage = await Storage.findByIdAndUpdate(storageId, storageDetails, { new: true })

      logger.info(`[${CONTEXT}] Storage updated successfully: ${storageId}`)
      return updatedStorage

    } catch (error) {
      logger.error(`[${CONTEXT}][updateStorage] :: ${error.message}`, error)
      throw error
    }
  }

  async deleteStorage(storageId) {
    try {
      logger.info(`[${CONTEXT}] Deleting storage: ${storageId}`)
      const deletedStorage = await Storage.findByIdAndDelete(storageId)

      logger.info(`[${CONTEXT}] Storage deleted successfully: ${storageId}`)
      return deletedStorage

    } catch (error) {
      logger.error(`[${CONTEXT}][deleteStorage] :: ${error.message}`, error)
      throw error
    }
  }

  async addProductToStorage(storageId, productId, quantity = 1) {
    try {
      logger.info(`[${CONTEXT}] Adding ${quantity} pieces of product ${productId} to storage ${storageId}`)
      
      const storage = await Storage.findById(storageId)
      if (!storage) {
        throw new Error('Storage not found')
      }
      
      const existingProductIndex = storage.products.findIndex(
        p => p.product.toString() === productId.toString()
      )
      
      let updatedStorage
      if (existingProductIndex >= 0) {
        updatedStorage = await Storage.findByIdAndUpdate(
          storageId,
          { $inc: { [`products.${existingProductIndex}.quantity`]: quantity } },
          { new: true }
        )
      } else {
          updatedStorage = await Storage.findByIdAndUpdate(
          storageId,
          { $push: { products: { product: productId, quantity } } },
          { new: true }
        )
      }

      logger.info(`[${CONTEXT}] Product added to storage successfully`)
      return updatedStorage

    } catch (error) {
      logger.error(`[${CONTEXT}][addProductToStorage] :: ${error.message}`, error)
      throw error
    }
  }

  async removeProductFromStorage(storageId, productId, quantity = 1) {
    try {
      logger.info(`[${CONTEXT}] Removing ${quantity} pieces of product ${productId} from storage ${storageId}`)
      
      const storage = await Storage.findById(storageId)
      if (!storage) {
        throw new Error('Storage not found')
      }
      
      const existingProductIndex = storage.products.findIndex(
        p => p.product.toString() === productId.toString()
      )
      
      if (existingProductIndex < 0) {
        throw new Error('Product not found in storage')
      }
      
      const currentQuantity = storage.products[existingProductIndex].quantity
      let updatedStorage
      
      if (currentQuantity <= quantity) {
          updatedStorage = await Storage.findByIdAndUpdate(
          storageId,
          { $pull: { products: { product: productId } } },
          { new: true }
        )
      } else {
          updatedStorage = await Storage.findByIdAndUpdate(
          storageId,
          { $inc: { [`products.${existingProductIndex}.quantity`]: -quantity } },
          { new: true }
        )
      }

      logger.info(`[${CONTEXT}] Product removed from storage successfully`)
      return updatedStorage

    } catch (error) {
      logger.error(`[${CONTEXT}][removeProductFromStorage] :: ${error.message}`, error)
      throw error
    }
  }

  async updateStorageCapacity(storageId, capacityDetails) {
    try {
      logger.info(`[${CONTEXT}] Updating capacity for storage: ${storageId}`)
      const { holdingCapacity, capacityOccupied } = capacityDetails
      const updatedStorage = await Storage.findByIdAndUpdate(
        storageId,
        { $set: { holdingCapacity, capacityOccupied } },
        { new: true }
      )

      logger.info(`[${CONTEXT}] Storage capacity updated successfully`)
      return updatedStorage

    } catch (error) {
      logger.error(`[${CONTEXT}][updateStorageCapacity] :: ${error.message}`, error)
      throw error
    }
  }

  async updateStorageVolume(storageId, volumeDetails) {
    try {
      logger.info(`[${CONTEXT}] Updating volume for storage: ${storageId}`)
      const { Volume, VolumeOccupied } = volumeDetails
      const updatedStorage = await Storage.findByIdAndUpdate(
        storageId,
        { $set: { Volume, VolumeOccupied } },
        { new: true }
      )

      logger.info(`[${CONTEXT}] Storage volume updated successfully`)
      return updatedStorage

    } catch (error) {
      logger.error(`[${CONTEXT}][updateStorageVolume] :: ${error.message}`, error)
      throw error
    }
  }

  async updateDimensions(storageId, dimensions) {
    try {
      logger.info(`[${CONTEXT}] Updating dimensions for storage: ${storageId}`)
      const updatedStorage = await Storage.findByIdAndUpdate(
        storageId,
        { $set: { dimensions } },
        { new: true }
      )

      logger.info(`[${CONTEXT}] Storage dimensions updated successfully`)
      return updatedStorage

    } catch (error) {
      logger.error(`[${CONTEXT}][updateDimensions] :: ${error.message}`, error)
      throw error
    }
  }

  async getStorageUtilization(storageId) {
    try {
      logger.info(`[${CONTEXT}] Fetching utilization for storage: ${storageId}`)
      const storage = await Storage.findById(storageId)
      if (!storage) {
        throw new BadRequestError('Storage not found.')
      }

      const capacityUtilization = storage.holdingCapacity > 0 
        ? (storage.capacityOccupied / storage.holdingCapacity) * 100 
        : 0
      const volumeUtilization = storage.Volume > 0 
        ? (storage.VolumeOccupied / storage.Volume) * 100 
        : 0

      return {
        capacityUtilization: `${capacityUtilization.toFixed(2)}%`,
        volumeUtilization: `${volumeUtilization.toFixed(2)}%`,
        totalCost: storage.totalCost || 0,
        capacityOccupied: storage.capacityOccupied,
        holdingCapacity: storage.holdingCapacity,
        volumeOccupied: storage.VolumeOccupied,
        totalVolume: storage.Volume
      }

    } catch (error) {
      logger.error(`[${CONTEXT}][getStorageUtilization] :: ${error.message}`, error)
      throw error
    }
  }
}

module.exports = StorageRepository