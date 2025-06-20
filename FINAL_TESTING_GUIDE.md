# Comprehensive Testing Guide - Inventory Management System

## Overview
This guide provides step-by-step instructions for testing the complete Inventory Management System with full quantity-based operations. The system has been upgraded to handle product quantities robustly across all modules including inventory, storage, transportation, and orders.

## Prerequisites
- Node.js and npm installed
- MongoDB running on localhost:27017
- Postman application (for API testing)
- Server running on http://localhost:4444

## Quick Start Testing

### 1. Start the Server
```bash
cd /Users/pranav/Developer/InventoryMS-BE
npm install
npm start
```

### 2. Import Postman Collection
- Open Postman
- Import the file: `FINAL_POSTMAN_COLLECTION.json`
- This collection contains 70+ test cases covering all scenarios

### 3. Run Complete Test Suite
- Select the "Inventory Management System - Complete API Testing Suite" collection
- Click "Run Collection" to execute all tests sequentially
- Monitor test results for any failures

## Detailed Testing Scenarios

### Authentication & Authorization
1. **User Registration**
   - Register regular users and admin users
   - Verify role assignments
   - Test duplicate email handling

2. **Login & Token Management**
   - Login with valid credentials
   - Extract and store JWT tokens
   - Test invalid credentials

3. **Access Control**
   - Test authenticated endpoints
   - Verify admin-only operations
   - Test unauthorized access blocking

### Product Management with Quantities
1. **Product Creation**
   - Create products with all required fields
   - Test validation for missing/invalid data
   - Verify product ID generation

2. **Stock Management**
   - Add stock quantities to products
   - Update product details including quantities
   - Test stock validation for orders

3. **Product Queries**
   - Get all products
   - Get single product details
   - Get products by category
   - Get products needing restock

### Inventory Management with Quantities
1. **Inventory Creation**
   - Create inventory locations with capacity limits
   - Test validation for required fields
   - Verify inventory ID generation

2. **Product Addition with Quantities**
   - Add products to inventory with specific quantities
   - Test quantity aggregation (adding same product multiple times)
   - Verify capacity and volume calculations

3. **Product Removal with Quantities**
   - Remove partial quantities from inventory
   - Test complete product removal (quantity = 0)
   - Verify stock validation

4. **Capacity Management**
   - Test over-capacity error scenarios
   - Verify volume and weight calculations
   - Test utilization metrics

5. **Business Logic Validation**
   - Verify cost calculations based on quantities
   - Test capacity utilization percentages
   - Validate inventory value calculations

### Storage Management with Quantities
1. **Storage Location Creation**
   - Create storage locations with capacity
   - Link storage to inventory
   - Test validation rules

2. **Product Storage with Quantities**
   - Add products to storage with quantities
   - Test quantity aggregation
   - Verify capacity constraints

3. **Storage Operations**
   - Partial quantity removal
   - Complete product removal
   - Storage utilization tracking

4. **Storage Analytics**
   - Cost summary calculations
   - Utilization metrics
   - Storage optimization data

### Order Management with Quantities
1. **Order Creation**
   - Create orders with multiple products and quantities
   - Verify automatic cost, weight, and volume calculations
   - Test stock validation during order placement

2. **Order Processing**
   - Update order status
   - Track order progress
   - Verify inventory deduction

3. **Error Scenarios**
   - Insufficient stock handling
   - Invalid product quantities
   - Missing required fields

### Transportation Management
1. **Transportation Tracking**
   - View all transportation orders
   - Get single order details
   - Filter by status

2. **Delivery Management**
   - Update delivery status
   - Track location updates
   - Monitor overdue deliveries

### Error Handling & Edge Cases
1. **Quantity Validation**
   - Negative quantity rejection
   - Zero quantity handling
   - Non-numeric quantity validation

2. **Product Validation**
   - Non-existent product handling
   - Invalid product ID format
   - Missing product references

3. **Authentication Errors**
   - Invalid token handling
   - Expired token scenarios
   - Missing authorization headers

4. **Business Logic Errors**
   - Over-capacity scenarios
   - Insufficient stock errors
   - Invalid operation sequences

## API Endpoints Testing Checklist

### User Management
- [ ] POST /api/v1/users/register
- [ ] POST /api/v1/users/login  
- [ ] POST /api/v1/users/logout
- [ ] GET /api/v1/users/me
- [ ] GET /api/v1/users/
- [ ] PUT /api/v1/users/
- [ ] PUT /api/v1/users/update_password
- [ ] PUT /api/v1/users/:id (Admin)

### Product Management
- [ ] POST /api/v1/products
- [ ] GET /api/v1/products
- [ ] GET /api/v1/products/:id
- [ ] PUT /api/v1/products/:id
- [ ] GET /api/v1/products/needsRestock
- [ ] GET /api/v1/products/category/:category

### Inventory Management
- [ ] POST /api/v1/inventory/create
- [ ] GET /api/v1/inventory/
- [ ] GET /api/v1/inventory/:id
- [ ] PUT /api/v1/inventory/:id
- [ ] POST /api/v1/inventory/:id/products (Add with quantity)
- [ ] DELETE /api/v1/inventory/:id/products (Remove with quantity)
- [ ] GET /api/v1/inventory/:id/products
- [ ] GET /api/v1/inventory/:id/utilization
- [ ] GET /api/v1/inventory/:id/cost-summary

### Storage Management
- [ ] POST /api/v1/storages
- [ ] GET /api/v1/storages
- [ ] GET /api/v1/storages/:id
- [ ] PUT /api/v1/storages/:id
- [ ] POST /api/v1/storages/:id/products (Add with quantity)
- [ ] DELETE /api/v1/storages/:id/products (Remove with quantity)
- [ ] GET /api/v1/storages/:id/utilization
- [ ] GET /api/v1/storages/:id/cost-summary

### Order & Transportation Management  
- [ ] POST /api/v1/buy/order
- [ ] PUT /api/v1/buy/order
- [ ] GET /api/v1/transports
- [ ] GET /api/v1/transports/:id
- [ ] GET /api/v1/transports/status/:status
- [ ] GET /api/v1/transports/overdue

### Wage Management
- [ ] GET /api/v1/wages/
- [ ] POST /api/v1/wages/calculate
- [ ] GET /api/v1/wages/overworked
- [ ] PUT /api/v1/wages/:userId

### Alert Management
- [ ] GET /api/v1/alerts/
- [ ] POST /api/v1/alerts/trigger

## Key Features to Test

### Quantity-Based Operations
1. **Aggregation Logic**
   - Adding same product multiple times should aggregate quantities
   - Verify quantity totals in inventory and storage

2. **Partial Removal**
   - Removing partial quantities should reduce total, not eliminate product
   - Complete removal should eliminate product from arrays

3. **Business Calculations**
   - Total value = sum(product.price * quantity)
   - Total weight = sum(product.weight * quantity)  
   - Total volume = sum(product.volume * quantity)

4. **Capacity Validation**
   - Prevent over-capacity additions
   - Verify weight and volume constraints
   - Test capacity utilization calculations

### Error Scenarios to Validate
1. **Quantity Errors**
   - Negative quantities rejected
   - Zero quantities rejected
   - Non-numeric quantities rejected

2. **Stock Validation**
   - Insufficient stock for orders
   - Stock validation across inventory/storage
   - Proper error messages

3. **Authorization Errors**
   - Unauthorized access blocked
   - Admin-only operations protected
   - Proper HTTP status codes

## Performance Testing
1. **Large Quantity Operations**
   - Test with large quantity values
   - Verify calculation performance
   - Monitor memory usage

2. **Bulk Operations**
   - Multiple product additions
   - Large inventory operations
   - Concurrent user testing

## Data Integrity Testing
1. **Database Consistency**
   - Verify quantity updates in database
   - Check referential integrity
   - Validate aggregation results

2. **Transaction Safety**
   - Test concurrent operations
   - Verify atomic updates
   - Check rollback scenarios

## Regression Testing
After any code changes, run the complete test suite to ensure:
- [ ] All existing functionality works
- [ ] No new bugs introduced
- [ ] Performance not degraded
- [ ] All business rules maintained

## Test Data Setup
Use the Postman collection's test data or create your own:
- 2+ test products with different properties
- 1+ inventory location
- 1+ storage location  
- Test users (regular and admin)
- Sample orders with multiple products

## Expected Results
All tests in the Postman collection should pass, demonstrating:
- ✅ Full quantity support across all modules
- ✅ Proper business logic implementation
- ✅ Robust error handling
- ✅ Secure authentication and authorization
- ✅ Accurate calculations and aggregations
- ✅ Professional API responses without emojis

## Troubleshooting
If tests fail:
1. Check server logs for detailed error messages
2. Verify database connection and data
3. Ensure all environment variables are set
4. Check Postman collection variables are populated
5. Verify product stock levels before operations

## Continuous Testing
- Run the complete test suite before deploying
- Set up automated testing in CI/CD pipeline
- Monitor API performance and error rates
- Regular security testing and updates

This comprehensive testing approach ensures the Inventory Management System is fully functional, secure, and ready for production use with complete quantity-based operations support.
