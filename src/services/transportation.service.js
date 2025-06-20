const logger = require('../utils/logger')
const { NotFoundError, BadRequestError } = require('../errors/client.error')
const mongoose = require('mongoose')

const CONTEXT = 'TransportationService'

class TransportationService {
  constructor(TransportationRepository, ProductRepository) {
    this.TransportationRepository = TransportationRepository
    this.ProductRepository = ProductRepository
  }

  async createTransportation(transportationDetails) {
    logger.info(`[${CONTEXT}] Creating new transportation with details: ${JSON.stringify(transportationDetails)}`)
    
      if (transportationDetails.products && transportationDetails.products.length > 0) {
      const calculatedDetails = await this.calculateOrderTotals(transportationDetails.products)
      transportationDetails.totalWeight = calculatedDetails.totalWeight
      transportationDetails.totalVolume = calculatedDetails.totalVolume
      transportationDetails.totalValue = calculatedDetails.totalValue
      
      await this.validateStockAvailability(transportationDetails.products)
    }
    
    const transportation = await this.TransportationRepository.createTransportation(transportationDetails)
    logger.info(`[${CONTEXT}] Transportation created successfully: ${transportation._id}`)
    return transportation
  }

  async calculateOrderTotals(products) {
    logger.info(`[${CONTEXT}] Calculating order totals for products`)
    let totalWeight = 0
    let totalVolume = 0
    let totalValue = 0

    for (const item of products) {
      const product = await this.ProductRepository.getProductById(item.product)
      if (!product) {
        throw new NotFoundError(`Product not found: ${item.product}`)
      }

      const quantity = item.quantity || 1
      const productVolume = (product.dimensions?.length || 0) * 
                           (product.dimensions?.width || 0) * 
                           (product.dimensions?.height || 0)

      totalWeight += (product.weight || 0) * quantity
      totalVolume += productVolume * quantity
      totalValue += (product.price || 0) * quantity
    }

    logger.info(`[${CONTEXT}] Order totals calculated - Weight: ${totalWeight}, Volume: ${totalVolume}, Value: ${totalValue}`)
    return { totalWeight, totalVolume, totalValue }
  }

  async validateStockAvailability(products) {
    logger.info(`[${CONTEXT}] Validating stock availability`)
    
    for (const item of products) {
      const product = await this.ProductRepository.getProductById(item.product)
      if (!product) {
        throw new NotFoundError(`Product not found: ${item.product}`)
      }

      const requestedQuantity = item.quantity || 1
      if (product.quantity < requestedQuantity) {
        throw new BadRequestError(`Insufficient stock for product ${product.productName}. Available: ${product.quantity}, Requested: ${requestedQuantity}`)
      }
    }
    
    logger.info(`[${CONTEXT}] Stock availability validated successfully`)
  }

  async getTransportation(transportationId) {
    logger.info(`[${CONTEXT}] Fetching transportation by ID: ${transportationId}`)
    const transportation = await this.TransportationRepository.getTransportationById(transportationId)
    if (!transportation) {
      logger.warn(`[${CONTEXT}] Transportation not found with ID: ${transportationId}`)
      throw new NotFoundError('Transportation not found')
    }
    logger.info(`[${CONTEXT}] Fetched transportation successfully: ${transportation._id}`)
    return transportation
  }

  async getAllDeliveries() {
    logger.info(`[${CONTEXT}] Fetching all deliveries`)
    const deliveries = await this.TransportationRepository.getAllDeliveries()
    logger.info(`[${CONTEXT}] Fetched all deliveries successfully. Count: ${deliveries.length}`)
    return deliveries
  }

  async getDeliveriesByAssignee(assignedTo) {
    logger.info(`[${CONTEXT}] Fetching deliveries for assignee: ${assignedTo}`)
    const deliveries = await this.TransportationRepository.getTransportationByAssignee(assignedTo)
    logger.info(`[${CONTEXT}] Fetched deliveries for assignee ${assignedTo} successfully. Count: ${deliveries.length}`)
    return deliveries
  }

  async getDeliveriesByStatus(status) {
    logger.info(`[${CONTEXT}] Fetching deliveries with status: ${status}`)
    const deliveries = await this.TransportationRepository.getDeliveriesByStatus(status)
    logger.info(`[${CONTEXT}] Fetched deliveries for status ${status} successfully. Count: ${deliveries.length}`)
    return deliveries
  }

  async getOverdueDeliveries() {
    logger.info(`[${CONTEXT}] Fetching overdue deliveries`)
    const deliveries = await this.TransportationRepository.getOverdueDeliveries()
    logger.info(`[${CONTEXT}] Fetched overdue deliveries successfully. Count: ${deliveries.length}`)
    return deliveries
  }

  async updateTransportation(transportationId, transportationDetails) {
    logger.info(`[${CONTEXT}] Updating transportation: ${transportationId}`)
    const updatedTransportation = await this.TransportationRepository.updateTransportation(transportationId, transportationDetails)
    if (!updatedTransportation) {
      throw new NotFoundError('Transportation not found')
    }
    logger.info(`[${CONTEXT}] Transportation updated successfully: ${transportationId}`)
    return updatedTransportation
  }

  async updateTransportationStatus(transportationId, status) {
    logger.info(`[${CONTEXT}] Updating transportation status for ${transportationId} to ${status}`)
    const updatedTransportation = await this.TransportationRepository.updateTransportation(transportationId, { status })
    if (!updatedTransportation) {
        throw new NotFoundError('Transportation not found')
    }
    logger.info(`[${CONTEXT}] Transportation status updated successfully for: ${transportationId}`)
    return updatedTransportation
  }

  async deleteTransportation(transportationId) {
    logger.info(`[${CONTEXT}] Deleting transportation: ${transportationId}`)
    const deletedTransportation = await this.TransportationRepository.deleteTransportation(transportationId)
    if (!deletedTransportation) {
      throw new NotFoundError('Transportation not found')
    }
    logger.info(`[${CONTEXT}] Transportation deleted successfully: ${transportationId}`)
    return deletedTransportation
  }
}

module.exports = TransportationService
