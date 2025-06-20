# Inventory Management System

A full-stack inventory management system with a Node.js/Express backend and React frontend.

## Features

### Backend (Node.js/Express)
- **User Management**: Registration, login, profile management with role-based access (admin, staff, supplier, driver)
- **Product Management**: Create, read, update, delete products with categories, pricing, and stock tracking
- **Inventory Management**: Manage multiple inventories, track capacity utilization, cost summaries
- **Transportation**: Track deliveries and transportation status
- **Storage Management**: Manage storage units with capacity and temperature controls
- **Wage Management**: Calculate wages, track work hours, identify overworked employees
- **Alerts System**: System alerts and notifications
- **Authentication**: JWT-based authentication with cookies

### Frontend (React)
- **Clean, Minimal UI**: Boxy design with structured containers, no graphics/illustrations
- **Dashboard**: Overview of products, inventories, users, and alerts
- **Product Management**: Full CRUD operations with search and filtering
- **Inventory Management**: Detailed inventory views with product assignments
- **User Management**: View and manage system users (admin only)
- **Transportation Tracking**: View delivery status and transportation records with safe location rendering
- **Storage Management**: Manage storage units and capacity
- **Wage Management**: View wages and overworked employees
- **Alerts**: View system alerts and trigger test alerts
- **Profile Management**: Update profile and change password
- **Responsive Design**: Works on desktop and mobile
- **Safe Object Rendering**: Properly handles complex data structures (GeoJSON locations) without React rendering errors

## Important Notes

### Location Data Handling
The transportation system uses GeoJSON Point objects for location data, which are automatically converted to readable coordinate strings in the UI to prevent React rendering errors. The system safely handles various location formats including:
- GeoJSON Point objects with coordinates
- String addresses
- Location objects with city/state properties
- Empty or undefined location data

## Tech Stack

### Backend
- Node.js & Express.js
- MongoDB with Mongoose
- JWT Authentication
- bcrypt for password hashing
- Winston for logging
- Zod for validation
- CORS enabled

### Frontend
- React 18
- React Router for navigation
- Axios for API calls
- Context API for state management
- CSS Grid and Flexbox for layouts

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud)
- npm

### Backend Setup

1. Install dependencies:
```bash
npm install
```

2. Start the backend server:
```bash
npm run dev
```

The backend will run on `http://localhost:4444`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the frontend development server:
```bash
npm start
```

The frontend will run on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/v1/users/register` - Register new user
- `POST /api/v1/users/login` - User login
- `POST /api/v1/users/logout` - User logout
- `GET /api/v1/users/me` - Get current user

### Products
- `GET /api/v1/products/` - Get all products
- `POST /api/v1/products/` - Create product (authenticated)
- `GET /api/v1/products/:id` - Get single product
- `PUT /api/v1/products/:id` - Update product (authenticated)
- `DELETE /api/v1/products/:id` - Delete product (admin)

### Inventory
- `GET /api/v1/inventory/` - Get all inventories
- `POST /api/v1/inventory/create` - Create inventory (admin)
- `GET /api/v1/inventory/:id` - Get single inventory
- `POST /api/v1/inventory/:id/products` - Add product to inventory

### Users (Authentication Required)
- `GET /api/v1/users/` - Get all users
- `PUT /api/v1/users/:id` - Update user (admin)
- `DELETE /api/v1/users/:id` - Delete user (admin)

### Other Endpoints
- Transportation, Storage, Wages, Alerts - See routes files for full API

## Project Structure

```
├── backend/
│   ├── src/
│   │   ├── config/         # Database and server configuration
│   │   ├── controllers/    # Route controllers
│   │   ├── dto/           # Data validation schemas
│   │   ├── middlewares/   # Authentication and error handling
│   │   ├── models/        # MongoDB models
│   │   ├── repositories/  # Data access layer
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   └── utils/         # Utility functions
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── contexts/      # React contexts
│   │   ├── pages/         # Page components
│   │   ├── api.js         # API client
│   │   ├── App.js         # Main app component
│   │   └── index.css      # Global styles
│   └── package.json
└── README.md
```

## Key Features

### Public Access
- Dashboard overview
- View products and inventory (read-only)
- View transportation and storage info
- View alerts

### Authenticated Access
- Create and edit products
- Manage inventory assignments
- View wages and user management
- Profile management

### Admin Access
- Full user management
- Delete products and inventories
- System administration features

## Design Philosophy

The frontend follows a minimal, boxy design approach:
- Clean layout with structured containers
- No graphics, illustrations, or icons
- No gradients or fancy styling
- Focus on functionality and readability
- Fast and lightweight interface
- Clear typography and spacing

## Environment Variables

Backend `.env` file should contain:
```
PORT=4444
MONGO_URI=your_mongodb_connection_string
JWT_SECRET_KEY=your_jwt_secret
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the ISC License.
