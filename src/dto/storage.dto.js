const { z } = require('zod')

const createStorageSchema = z.object({

  locationId: z.string().min(2).max(40),
  dimensions: z.object({ length: z.number(), width: z.number(), height: z.number()}),
  holdingCapacity: z.number(),
  Volume: z.number().optional(),
  inventory: z.string().min(1, "Inventory ID is required")

}).strict()

const updateStorageSchema = z.object({

  locationId: z.string().min(2).max(40).optional(),
  dimensions: z.object({ length: z.number(), width: z.number(), height: z.number()}).optional(),
  holdingCapacity: z.number().optional(),
  capacityOccupied: z.number().optional(),
  Volume: z.number().optional(),
  VolumeOccupied: z.number().optional(),
  totalCost: z.number().optional(),
  products: z.array(z.string()).optional(),
  inventory: z.string().optional()

}).strict()

const addProductSchema = z.object({

  productId: z.string(),
  quantity: z.number().min(1, "Quantity must be at least 1").optional().default(1)

}).strict()

const removeProductSchema = z.object({

  productId: z.string(),
  quantity: z.number().min(1, "Quantity must be at least 1").optional().default(1)
  
}).strict()

module.exports = {
  createStorageSchema,
  updateStorageSchema,
  addProductSchema,
  removeProductSchema
}