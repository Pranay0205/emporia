# Emporia E-commerce Platform

A full-stack e-commerce platform built with Python Flask backend and React TypeScript frontend, featuring user management, product catalog, shopping cart, and order processing.

## 🚀 Features

### Core Functionality
- **User Management**: Registration and authentication for customers, sellers, and admins
- **Product Catalog**: Browse products by category with filtering and search
- **Shopping Cart**: Add, update, and remove items from cart
- **Order Processing**: Place orders with payment integration
- **Order History**: Track and manage order status

### User Roles
- **Customers**: Browse products, manage cart, place orders
- **Sellers**: Manage product listings, view sales
- **Admins**: System administration and user management

### Architecture Patterns
- **Factory Pattern**: User creation with UserFactory
- **Command Pattern**: Order processing with command invoker
- **Repository Pattern**: Data access abstraction
- **Service Layer**: Business logic separation

## 🛠️ Tech Stack

### Backend
- **Framework**: Flask (Python)
- **Database**: MySQL
- **Authentication**: Session-based with password hashing
- **Architecture**: Layered architecture with repositories and services

### Frontend
- **Framework**: React 19 with TypeScript
- **Styling**: Chakra UI + Tailwind CSS
- **Routing**: React Router DOM
- **Build Tool**: Vite
- **Form Handling**: React Hook Form

## 📁 Project Structure

```
emporia/
├── emporia-api/                 # Backend Flask application
│   ├── command/                 # Command pattern implementation
│   ├── factories/               # Factory pattern for user creation
│   ├── models/                  # Data models
│   │   ├── Users/              # User-related models
│   │   ├── Product/            # Product and category models
│   │   └── Order/              # Order and cart models
│   ├── repositories/           # Data access layer
│   │   ├── interfaces/         # Repository interfaces
│   │   └── database/           # Database implementations
│   ├── routes/                 # API endpoints
│   ├── services/               # Business logic layer
│   └── app.py                  # Application entry point
├── emporia-UI/                 # Frontend React application
│   ├── src/
│   │   ├── components/
│   │   │   ├── pages/          # Page components
│   │   │   ├── ui/             # Reusable UI components
│   │   │   └── routing/        # Route protection
│   │   └── App.tsx             # Application entry point
└── database-scripts/           # Database setup scripts
```

## 🚀 Getting Started

### Prerequisites
- Python 3.8+
- Node.js 18+
- MySQL 8.0+
- npm or yarn

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd emporia
   ```

2. **Set up Python virtual environment**
   ```bash
   cd emporia-api
   python -m venv venv
   
   # Windows
   venv\Scripts\activate
   
   # macOS/Linux
   source venv/bin/activate
   ```

3. **Install Python dependencies**
   ```bash
   pip install flask flask-cors mysql-connector-python configparser
   ```

4. **Database Setup**
   ```bash
   # Create MySQL database
   mysql -u root -p
   CREATE DATABASE EMPORIA_DB;
   
   # Run table creation script
   mysql -u root -p EMPORIA_DB < database-scripts/table_creation_script.sql
   ```

5. **Configure database connection**
   ```bash
   # Create configs/config.ini
   mkdir configs
   cat > configs/config.ini << EOF
   [database]
   host = localhost
   user = your_mysql_username
   password = your_mysql_password
   database = EMPORIA_DB
   
   [server]
   secret_key = your_secret_key_here
   EOF
   ```

6. **Run the Flask application**
   ```bash
   python app.py
   ```
   The API will be available at `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd emporia-UI
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Create .env file
   echo "VITE_API_URL=http://localhost:5000" > .env
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173`

## 🗄️ Database Schema

### Core Tables
- **users**: Base user information
- **customers**: Customer-specific data
- **sellers**: Seller store information
- **admins**: Admin permissions
- **categories**: Product categories
- **products**: Product catalog
- **shopping_carts**: User shopping carts
- **cart_items**: Cart item details
- **orders**: Order information
- **order_items**: Order item details

## 🔗 API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout

### Products
- `GET /products` - Get all products
- `GET /products/{id}` - Get product by ID
- `POST /products` - Create product (sellers only)
- `PUT /products/{id}` - Update product
- `DELETE /products/{id}` - Delete product

### Categories
- `GET /categories` - Get all categories
- `POST /categories` - Create category
- `PUT /categories/{id}` - Update category
- `DELETE /categories/{id}` - Delete category

### Cart
- `GET /cart` - Get user's cart
- `POST /cart/items` - Add item to cart
- `PUT /cart/items/{product_id}` - Update cart item
- `DELETE /cart/items/{product_id}` - Remove from cart

### Orders
- `POST /orders` - Place order
- `GET /orders` - Get user's orders
- `GET /orders/{id}` - Get specific order
- `POST /orders/{id}/cancel` - Cancel order

## 🔐 Authentication

The application uses session-based authentication with:
- Password hashing using SHA-256
- Role-based access control
- Session management for maintaining login state

## 🎨 Frontend Features

### Pages
- **Landing Page**: Welcome page with feature highlights
- **Registration**: Multi-role user registration
- **Login**: User authentication
- **Market**: Product browsing with category filtering
- **Cart**: Shopping cart management
- **Orders**: Order history and tracking
- **Products**: Seller product management (sellers only)
- **Categories**: Category management (admins only)

### UI Components
- Responsive design with Chakra UI
- Dark theme with glassmorphism effects
- Interactive animations and hover effects
- Form validation with React Hook Form
- Toast notifications for user feedback

## 🔧 Development

### Running Tests
```bash
# Backend tests
cd emporia-api
python test/user_creation_test.py

# Frontend tests
cd emporia-UI
npm test
```

### Code Formatting
```bash
# Frontend
npm run lint
```

## 🚀 Deployment

### Backend Deployment
1. Set up production database
2. Configure production settings in `config.ini`
3. Use a WSGI server like Gunicorn:
   ```bash
   pip install gunicorn
   gunicorn app:app
   ```

### Frontend Deployment
1. Build the production bundle:
   ```bash
   npm run build
   ```
2. Deploy the `dist` folder to your hosting service

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👥 Team

- Backend Development: Python/Flask API with MySQL
- Frontend Development: React/TypeScript with Chakra UI
- Database Design: MySQL with normalized schema
- Architecture: Layered architecture with design patterns

## 🐛 Known Issues

- Payment integration is currently simulated
- Image upload functionality needs implementation
- Real-time notifications not implemented

## 🔮 Future Enhancements

- [ ] Real payment gateway integration
- [ ] Image upload and management
- [ ] Real-time notifications
- [ ] Advanced search and filtering
- [ ] Product reviews and ratings
- [ ] Inventory management dashboard
- [ ] Analytics and reporting
- [ ] Mobile responsive improvements

## 📞 Support

For support and questions, please open an issue in the repository or contact the development team.

---

**Emporia** - Your One-Stop Shopping Platform
