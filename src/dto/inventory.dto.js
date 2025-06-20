const { z } = require('zod')

const createInventorySchema = z.object({
  
  name: z.string().min(3).max(50),
  totalCapacity: z.number().nonnegative().optional(),
  totalVolume: z.number().nonnegative().optional(),
  inventoryLocation: z.object({
    type: z.literal('Point'),
    coordinates: z.array(z.number()).length(2, { message: "Coordinates must be an array of two numbers: [longitude, latitude]" })
  })

}).strict()

const updateInventorySchema = z.object({

  name: z.string().min(3).max(50).optional(),
  products: z.array(z.string()).optional(),
  totalCapacity: z.number().nonnegative().optional(),
  capacityOccupied: z.number().nonnegative().optional(),
  totalVolume: z.number().nonnegative().optional(),
  volumeOccupied: z.number().nonnegative().optional(),
  storage: z.array(z.string()).optional(),
  inventoryLocation: z.object({
    type: z.literal('Point'),
    coordinates: z.array(z.number()).length(2, { message: "Coordinates must be an array of two numbers: [longitude, latitude]" })
  }).optional()

}).strict().refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be updated',
  path: []
})

const addProductToInventorySchema = z.object({

  productId: z.string().min(1, "Product ID is required"),
  quantity: z.number().min(1, "Quantity must be at least 1").optional().default(1),
  storageId: z.string().optional()

}).strict()

const removeProductFromInventorySchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  quantity: z.number().min(1, "Quantity must be at least 1").optional().default(1)
}).strict()

const addStorageToInventorySchema = z.object({
  storageId: z.string().min(1, "Storage ID is required")
}).strict()

module.exports = {
  createInventorySchema,
  updateInventorySchema,
  addProductToInventorySchema,
  removeProductFromInventorySchema,
  addStorageToInventorySchema
}

/**
 * Example of location..
 * "inventoryLocation": {
    "type": "Point",
    "coordinates": [77.5946, 12.9716] // [longitude, latitude]
  }
 */