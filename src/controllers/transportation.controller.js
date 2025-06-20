const { StatusCodes } = require('http-status-codes')
const { TransportationService } = require('../services')
const { TransportationRepository, ProductRepository } = require('../repositories')
const logger = require('../utils/logger')
const ApiResponse = require('../dto/response.dto')

const CONTEXT = 'TransportationController'

const transportationService = new TransportationService(new TransportationRepository(), new ProductRepository())

const createTransportation = async (req, res) => {
  logger.info(`[${CONTEXT}] Creating new transportation with data: ${JSON.stringify(req.body)}`)
  const transportation = await transportationService.createTransportation(req.body)
  res.status(StatusCodes.CREATED).json(ApiResponse.success('Transportation created successfully', { transportation }))
  logger.info(`[${CONTEXT}] Transportation created successfully: ${transportation._id}`)
}

const getTransportation = async (req, res) => {
  logger.info(`[${CONTEXT}] Fetching transportation with ID: ${req.params.id}`)
  const transportation = await transportationService.getTransportation(req.params.id)
  res.status(StatusCodes.OK).json(ApiResponse.success('Transportation fetched successfully', { transportation }))
  logger.info(`[${CONTEXT}] Transportation fetched successfully: ${transportation._id}`)
}

const getAllTransportation = async (req, res) => {
  logger.info(`[${CONTEXT}] Fetching all deliveries`)
  const deliveries = await transportationService.getAllDeliveries()
  res.status(StatusCodes.OK).json(ApiResponse.success('All deliveries fetched successfully', { length: deliveries.length, deliveries }))
  logger.info(`[${CONTEXT}] All deliveries fetched successfully. Total: ${deliveries.length}`)
}

const updateTransportation = async (req, res) => {
  logger.info(`[${CONTEXT}] Updating transportation ID: ${req.params.id} with data: ${JSON.stringify(req.body)}`)
  const updatedTransportation = await transportationService.updateTransportation(req.params.id, req.body)
  res.status(StatusCodes.OK).json(ApiResponse.success('Transportation updated successfully', { transportation: updatedTransportation }))
  logger.info(`[${CONTEXT}] Transportation updated successfully: ${updatedTransportation._id}`)
}

const cancelTransportation = async (req, res) => {
  logger.info(`[${CONTEXT}] Deleting transportation ID: ${req.params.id}`)
  const deletedTransportation = await transportationService.deleteTransportation(req.params.id)
  res.status(StatusCodes.OK).json(ApiResponse.success('Transportation deleted successfully', { transportation: deletedTransportation }))
  logger.info(`[${CONTEXT}] Transportation deleted successfully: ${deletedTransportation._id}`)
}

const getDeliveriesByStatus = async (req, res) => {
    logger.info(`[${CONTEXT}] Fetching deliveries with status: ${req.params.status}`)
    const deliveries = await transportationService.getDeliveriesByStatus(req.params.status)
    res.status(StatusCodes.OK).json(ApiResponse.success('Deliveries fetched successfully', { deliveries }))
    logger.info(`[${CONTEXT}] Deliveries fetched for status ${req.params.status}. Count: ${deliveries.length}`)
}

const getOverdueDeliveries = async (req, res) => {
    logger.info(`[${CONTEXT}] Fetching overdue deliveries`)
    const deliveries = await transportationService.getOverdueDeliveries()
    res.status(StatusCodes.OK).json(ApiResponse.success('Overdue deliveries fetched successfully', { deliveries }))
    logger.info(`[${CONTEXT}] Overdue deliveries fetched. Count: ${deliveries.length}`)
}

const updateTransportationStatus = async (req, res) => {
    logger.info(`[${CONTEXT}] Updating transportation status for ID: ${req.params.id}`)
    const updatedTransportation = await transportationService.updateTransportationStatus(req.params.id, req.body.status)
    res.status(StatusCodes.OK).json(ApiResponse.success('Transportation status updated successfully', { transportation: updatedTransportation }))
    logger.info(`[${CONTEXT}] Transportation status updated successfully for: ${updatedTransportation._id}`)
}

const assignTransportation = async(req, res) => {
  res.status(StatusCodes.NOT_IMPLEMENTED).json({ message: "Not Implemented Yet "})
}

const getEta = async(req, res) => {
  res.status(StatusCodes.NOT_IMPLEMENTED).json({ message: "Not Implemented Yet "})
}

const getTransportationStatus = async(req, res) => {
  res.status(StatusCodes.NOT_IMPLEMENTED).json({ message: "Not Implemented Yet "})
}

module.exports = {
  createTransportation,
  getTransportation,
  getAllTransportation,
  updateTransportation,
  cancelTransportation,
  getDeliveriesByStatus,
  getOverdueDeliveries,
  updateTransportationStatus,
  assignTransportation,
  getEta,
  getTransportationStatus
}