const { z } = require('zod')

const createOrder = z.object({

  packageId: z.string().min(2).max(20),
  transportationCost: z.number().optional(),
  status: z.string().optional(),
  products: z.array(z.object({
    product: z.string(),
    quantity: z.number().min(1).optional().default(1)
  })).optional(),
  startLocation: z.object({
    type: z.literal('Point'),
    coordinates: z.array(z.number()).length(2, { message: "Coordinates must be an array of two numbers: [longitude, latitude]" })
  }).optional(),
  currentLocation: z.object({
    type: z.literal('Point'),
    coordinates: z.array(z.number()).length(2, { message: "Coordinates must be an array of two numbers: [longitude, latitude]" })
  }).optional(),
  destination: z.object({
    type: z.literal('Point'),
    coordinates: z.array(z.number()).length(2, { message: "Coordinates must be an array of two numbers: [longitude, latitude]" })
  }).optional(),
  assignedTo: z.string().optional(),
  eta: z.date().optional(),
  transportMode: z.enum(['land', 'air', 'ship'])

}).strict()

const updateOrder = createOrder.partial()

module.exports = {
  createOrder,
  updateOrder
}