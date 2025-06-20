const logger = require('../utils/logger')
const { Inventory } = require('../models')
const { BadRequestError } = require('../errors/client.error')

const CONTEXT = 'InventoryRepository'

class InventoryRepository {
  async createInventory(inventoryDetails) {
    try {
      logger.info(`[${CONTEXT}] Creating inventory with name: ${inventoryDetails.name}`)
      const inventory = await Inventory.create(inventoryDetails)

      logger.info(`[${CONTEXT}] Inventory created successfully: ${inventory._id}`)
      return inventory

    } catch (error) {
      logger.error(`[${CONTEXT}][createInventory] :: ${error.message}`, error)
      throw new BadRequestError('Error creating inventory.')
    }
  }

  async getInventoryById(inventoryId) {
    logger.info(`[${CONTEXT}] Fetching inventory by ID: ${inventoryId}`)
    return await Inventory.findById(inventoryId).populate('products').populate('storage')
  }

  async getAllInventories() {
    logger.info(`[${CONTEXT}] Fetching all inventories`)
    return await Inventory.find().populate('products').populate('storage')
  }

  async updateInventory(inventoryId, inventoryDetails) {
    try {
      logger.info(`[${CONTEXT}] Updating inventory: ${inventoryId}`)
      const updatedInventory = await Inventory.findByIdAndUpdate(inventoryId, inventoryDetails, { new: true })

      logger.info(`[${CONTEXT}] Inventory updated successfully: ${inventoryId}`)
      return updatedInventory

    } catch (error) {
      logger.error(`[${CONTEXT}][updateInventory] :: ${error.message}`, error)
      throw error
    }
  }

  async deleteInventory(inventoryId) {
    try {
      logger.info(`[${CONTEXT}] Deleting inventory: ${inventoryId}`)
      const deletedInventory = await Inventory.findByIdAndDelete(inventoryId)

      logger.info(`[${CONTEXT}] Inventory deleted successfully: ${inventoryId}`)
      return deletedInventory

    } catch (error) {
        logger.error(`[${CONTEXT}][deleteInventory] :: ${error.message}`, error)
        throw error
    }
  }

  async addProductToInventory(inventoryId, productId, quantity = 1) {
    try {
      logger.info(`[${CONTEXT}] Adding ${quantity} pieces of product ${productId} to inventory ${inventoryId}`)
      
      const inventory = await Inventory.findById(inventoryId)
      if (!inventory) {
        throw new Error('Inventory not found')
      }
      
      const existingProductIndex = inventory.products.findIndex(
        p => p.product.toString() === productId.toString()
      )
      
      let updatedInventory
      if (existingProductIndex >= 0) {
        updatedInventory = await Inventory.findByIdAndUpdate(
          inventoryId,
          { $inc: { [`products.${existingProductIndex}.quantity`]: quantity } },
          { new: true }
        )
      } else {
        updatedInventory = await Inventory.findByIdAndUpdate(
          inventoryId,
          { $push: { products: { product: productId, quantity } } },
          { new: true }
        )
      }

      logger.info(`[${CONTEXT}] Product added to inventory successfully`)
      return updatedInventory

    } catch (error) {
      logger.error(`[${CONTEXT}][addProductToInventory] :: ${error.message}`, error)
      throw error
    }
  }

  async removeProductFromInventory(inventoryId, productId, quantity = 1) {
    try {
      logger.info(`[${CONTEXT}] Removing ${quantity} pieces of product ${productId} from inventory ${inventoryId}`)
      
      const inventory = await Inventory.findById(inventoryId)
      if (!inventory) {
        throw new Error('Inventory not found')
      }
      
      const existingProductIndex = inventory.products.findIndex(
        p => p.product.toString() === productId.toString()
      )
      
      if (existingProductIndex < 0) {
        throw new Error('Product not found in inventory')
      }
      
      const currentQuantity = inventory.products[existingProductIndex].quantity
      let updatedInventory
      
      if (currentQuantity <= quantity) {
        updatedInventory = await Inventory.findByIdAndUpdate(
          inventoryId,
          { $pull: { products: { product: productId } } },
          { new: true }
        )
      } else {
        updatedInventory = await Inventory.findByIdAndUpdate(
          inventoryId,
          { $inc: { [`products.${existingProductIndex}.quantity`]: -quantity } },
          { new: true }
        )
      }

      logger.info(`[${CONTEXT}] Product removed from inventory successfully`)
      return updatedInventory

    } catch (error) {
      logger.error(`[${CONTEXT}][removeProductFromInventory] :: ${error.message}`, error)
      throw error
    }
  }

  async addStorageToInventory(inventoryId, storageId) {
    try {
      logger.info(`[${CONTEXT}] Adding storage ${storageId} to inventory ${inventoryId}`)
      const updatedInventory = await Inventory.findByIdAndUpdate(
        inventoryId,
        { $addToSet: { storage: storageId } },
        { new: true }
      )

      logger.info(`[${CONTEXT}] Storage added to inventory successfully`)
      return updatedInventory

    } catch (error) {
      logger.error(`[${CONTEXT}][addStorageToInventory] :: ${error.message}`, error)
      throw error
    }
  }

  async removeStorageFromInventory(inventoryId, storageId) {
    try {
      logger.info(`[${CONTEXT}] Removing storage ${storageId} from inventory ${inventoryId}`)
      const updatedInventory = await Inventory.findByIdAndUpdate(
        inventoryId,
        { $pull: { storage: storageId } },
        { new: true }
      )

      logger.info(`[${CONTEXT}] Storage removed from inventory successfully`)
      return updatedInventory
    } catch (error) {

      logger.error(`[${CONTEXT}][removeStorageFromInventory] :: ${error.message}`, error)
      throw error
    }
  }

  async getInventoryProductCount(inventoryId) {
    try {
      logger.info(`[${CONTEXT}] Getting product count for inventory: ${inventoryId}`)
      const inventory = await Inventory.findById(inventoryId)
      if (!inventory) {
        throw new BadRequestError('Inventory not found.')
      }
      return { productCount: inventory.products.length }

    } catch (error) {
      logger.error(`[${CONTEXT}][getInventoryProductCount] :: ${error.message}`, error)
      throw error
    }
  }

  async getInventoryCapacityUtilization(inventoryId) {
    try {
      logger.info(`[${CONTEXT}] Getting capacity utilization for inventory: ${inventoryId}`)
      const inventory = await Inventory.findById(inventoryId)
      if (!inventory) {
        throw new BadRequestError('Inventory not found.')
      }

      const capacityUtilization = inventory.totalCapacity > 0 
        ? (inventory.capacityOccupied / inventory.totalCapacity) * 100 
        : 0
      const volumeUtilization = inventory.totalVolume > 0 
        ? (inventory.volumeOccupied / inventory.totalVolume) * 100 
        : 0

      return { 
        capacityUtilization: `${capacityUtilization.toFixed(2)}%`,
        volumeUtilization: `${volumeUtilization.toFixed(2)}%`,
        totalCost: inventory.costPrice || 0,
        capacityOccupied: inventory.capacityOccupied,
        totalCapacity: inventory.totalCapacity,
        volumeOccupied: inventory.volumeOccupied,
        totalVolume: inventory.totalVolume
      }

    } catch (error) {
      logger.error(`[${CONTEXT}][getInventoryCapacityUtilization] :: ${error.message}`, error)
      throw error
    }
  }

  async getAllProductsInInventory(inventoryId) {
     try {
      logger.info(`[${CONTEXT}] Getting All products for inventory: ${inventoryId}`)
      const inventory = await Inventory.findById(inventoryId).populate('products')
      return inventory.products

    } catch (error) {
      logger.error(`[${CONTEXT}][getAllProductsInInventory] :: ${error.message}`, error)
      throw error
    }
  }
}

module.exports = InventoryRepository