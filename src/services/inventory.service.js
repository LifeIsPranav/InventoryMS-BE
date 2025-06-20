const logger = require('../utils/logger')
const { NotFoundError, BadRequestError } = require('../errors/client.error')
const { StorageRepository } = require('../repositories')

const CONTEXT = 'InventoryService'

class InventoryService {
  constructor(InventoryRepository, ProductRepository) {
    this.InventoryRepository = InventoryRepository
    this.ProductRepository = ProductRepository
  }

  async createInventory(inventoryDetails) {
    logger.info(`[${CONTEXT}] Creating new inventory with details: ${JSON.stringify(inventoryDetails)}`)
    const inventory = await this.InventoryRepository.createInventory(inventoryDetails)
    logger.info(`[${CONTEXT}] Inventory created successfully: ${inventory._id}`)
    return inventory
  }

  async getInventory(inventoryId) {
    logger.info(`[${CONTEXT}] Fetching inventory by ID: ${inventoryId}`)
    const inventory = await this.InventoryRepository.getInventoryById(inventoryId)
    if (!inventory) {
      logger.warn(`[${CONTEXT}] Inventory not found with ID: ${inventoryId}`)
      throw new NotFoundError('Inventory not found')
    }
    logger.info(`[${CONTEXT}] Fetched inventory successfully: ${inventory._id}`)
    return inventory
  }

  async getAllInventories() {
    logger.info(`[${CONTEXT}] Fetching all inventories`)
    const inventories = await this.InventoryRepository.getAllInventories()
    logger.info(`[${CONTEXT}] Fetched all inventories successfully. Count: ${inventories.length}`)
    return inventories
  }

  async updateInventory(inventoryId, inventoryDetails) {
    logger.info(`[${CONTEXT}] Updating inventory: ${inventoryId}`)
    const updatedInventory = await this.InventoryRepository.updateInventory(inventoryId, inventoryDetails)
    if (!updatedInventory) {
      throw new NotFoundError('Inventory not found')
    }
    logger.info(`[${CONTEXT}] Inventory updated successfully: ${inventoryId}`)
    return updatedInventory
  }

  async deleteInventory(inventoryId) {
    logger.info(`[${CONTEXT}] Deleting inventory: ${inventoryId}`)
    const deletedInventory = await this.InventoryRepository.deleteInventory(inventoryId)
    if (!deletedInventory) {
      throw new NotFoundError('Inventory not found')
    }
    logger.info(`[${CONTEXT}] Inventory deleted successfully: ${inventoryId}`)
    return deletedInventory
  }

  async addProductToInventory(inventoryId, productId, quantity = 1, storageId = null) {
    logger.info(`[${CONTEXT}] Adding ${quantity} pieces of product ${productId} to inventory ${inventoryId} ${storageId ? `via storage ${storageId}` : 'directly'}`)
    const product = await this.ProductRepository.getProductById(productId)
    if (!product) throw new NotFoundError('Product not found')

    const inventory = await this.InventoryRepository.getInventoryById(inventoryId)
    if (!inventory) throw new NotFoundError('Inventory not found')

    const productWeight = (product.weight || 0) * quantity
    const productVolume = ((product.dimensions?.length * product.dimensions?.width * product.dimensions?.height) || 0) * quantity
    const productCost = (product.price || 0) * quantity

    if (inventory.capacityOccupied + productWeight > inventory.totalCapacity) {
      throw new BadRequestError(`Product weight (${productWeight}) exceeds available inventory capacity (${inventory.totalCapacity - inventory.capacityOccupied})`)
    }
    if (inventory.volumeOccupied + productVolume > inventory.totalVolume) {
      throw new BadRequestError(`Product volume (${productVolume}) exceeds available inventory volume (${inventory.totalVolume - inventory.volumeOccupied})`)
    }

    if (product.quantity < quantity) {
      throw new BadRequestError(`Insufficient stock. Available: ${product.quantity}, Requested: ${quantity}`)
    }

    if (storageId) {
      const storageRepo = new StorageRepository()
    
      const storage = await storageRepo.getStorageById(storageId)
      if (!storage) throw new NotFoundError('Storage location not found')

      if (storage.capacityOccupied + productWeight > storage.holdingCapacity) {
        throw new BadRequestError(`Product weight (${productWeight}) exceeds available storage capacity (${storage.holdingCapacity - storage.capacityOccupied})`)
      }
      if (storage.VolumeOccupied + productVolume > storage.Volume) {
        throw new BadRequestError(`Product volume (${productVolume}) exceeds available storage volume (${storage.Volume - storage.VolumeOccupied})`)
      }

      await storageRepo.addProductToStorage(storageId, productId, quantity)
      await storageRepo.updateStorage(storageId, {
        $inc: { 
          capacityOccupied: productWeight,
          VolumeOccupied: productVolume,
          totalCost: productCost
        }
      })
    }

    const updatedInventory = await this.InventoryRepository.addProductToInventory(inventoryId, productId, quantity)
    
    await this.InventoryRepository.updateInventory(inventoryId, { 
      $inc: { 
        capacityOccupied: productWeight,
        volumeOccupied: productVolume,
        costPrice: productCost
      } 
    })

    await this.ProductRepository.updateProduct(productId, { 
      $inc: { quantity: -quantity }
    })

    if (storageId) {
      await this.ProductRepository.updateProduct(productId, { storage: storageId })
    }

    logger.info(`[${CONTEXT}] Product ${productId} added to inventory ${inventoryId} successfully. Cost: ${productCost}`)
    return updatedInventory
  }

  async removeProductFromInventory(inventoryId, productId, quantity = 1) {
    logger.info(`[${CONTEXT}] Removing ${quantity} pieces of product ${productId} from inventory ${inventoryId}`)
    const product = await this.ProductRepository.getProductById(productId)
    if (!product) {
      throw new NotFoundError('Product not found')
    }

    const productWeight = (product.weight || 0) * quantity
    const productVolume = ((product.dimensions?.length * product.dimensions?.width * product.dimensions?.height) || 0) * quantity
    const productCost = (product.price || 0) * quantity

    if (product.storage) {
      const storageRepo = new StorageRepository()
      await storageRepo.removeProductFromStorage(product.storage, productId, quantity)
      await storageRepo.updateStorage(product.storage, {
        $inc: { 
          capacityOccupied: -productWeight,
          VolumeOccupied: -productVolume,
          totalCost: -productCost
        }
      })
    }

    const updatedInventory = await this.InventoryRepository.removeProductFromInventory(inventoryId, productId, quantity)
    await this.InventoryRepository.updateInventory(inventoryId, { 
      $inc: { 
        capacityOccupied: -productWeight,
        volumeOccupied: -productVolume,
        costPrice: -productCost
      } 
    })

    await this.ProductRepository.updateProduct(productId, { 
      $inc: { quantity: quantity },
      $unset: { storage: "" }
    })

    logger.info(`[${CONTEXT}] Product ${productId} (${quantity} pieces) removed from inventory ${inventoryId} successfully. Cost deducted: ${productCost}`)
    return updatedInventory
  }

  async getInventoryCapacityUtilization(inventoryId) {
    logger.info(`[${CONTEXT}] Calculating capacity utilization for inventory: ${inventoryId}`)
    const result = await this.InventoryRepository.getInventoryCapacityUtilization(inventoryId)
    logger.info(`[${CONTEXT}] Inventory ${inventoryId} - Capacity: ${result.capacityUtilization}, Volume: ${result.volumeUtilization}, Total Cost: $${result.totalCost}`)
    return result
  }

  async getAllProductsInInventory(inventoryId) {
    logger.info(`[${CONTEXT}] Fetching all Products in Inventory: ${inventoryId}`)
    const products = await this.InventoryRepository.getAllProductsInInventory(inventoryId)
    
    logger.info(`[${CONTEXT}] Fetched inventory successfully: ${inventoryId}`)
    return { total: products.length, products }
  }

  async addStorageToInventory(inventoryId, storageId) {
    logger.info(`[${CONTEXT}] Adding storage ${storageId} to inventory ${inventoryId}`)
    
    const inventory = await this.InventoryRepository.getInventoryById(inventoryId)
    if (!inventory) throw new NotFoundError('Inventory not found')
    const updatedInventory = await this.InventoryRepository.addStorageToInventory(inventoryId, storageId)
    
    const storageRepo = new StorageRepository()
    await storageRepo.updateStorage(storageId, { inventory: inventoryId })

    logger.info(`[${CONTEXT}] Storage ${storageId} added to inventory ${inventoryId} successfully`)
    return updatedInventory
  }

  async removeStorageFromInventory(inventoryId, storageId) {
    logger.info(`[${CONTEXT}] Removing storage ${storageId} from inventory ${inventoryId}`)
    
    const storageRepo = new StorageRepository()
    const storage = await storageRepo.getStorageById(storageId)
    
    if (storage && storage.products.length > 0) throw new BadRequestError('Cannot remove storage with products. Please remove all products first.')

    const updatedInventory = await this.InventoryRepository.removeStorageFromInventory(inventoryId, storageId)
    await storageRepo.updateStorage(storageId, { $unset: { inventory: "" } })

    logger.info(`[${CONTEXT}] Storage ${storageId} removed from inventory ${inventoryId} successfully`)
    return updatedInventory
  }
}

module.exports = InventoryService
