# Emporia E-commerce Platform

Full-stack e-commerce platform with Flask backend and React frontend. Supports multiple user roles with product management, shopping cart, and order processing.

## Tech Stack

**Backend:** Flask (Python), MySQL, session-based authentication  
**Frontend:** React 19, TypeScript, Chakra UI, Vite  
**Architecture:** Factory, Command, and Repository patterns

### Backend

```bash
cd emporia-api
python -m venv venv && source venv/bin/activate
pip install flask flask-cors mysql-connector-python configparser

# Database
mysql -u root -p -e "CREATE DATABASE EMPORIA_DB"
mysql -u root -p EMPORIA_DB < database-scripts/table_creation_script.sql

# Configure configs/config.ini with your MySQL credentials

python app.py  # Runs on http://localhost:5000
```

### Frontend

```bash
cd emporia-UI
npm install
echo "VITE_API_URL=http://localhost:5000" > .env
npm run dev  # Runs on http://localhost:5173
```

## Features

**User Roles:** Customers (browse, cart, orders), Sellers (manage products), Admins (system management)

**Core:** Product catalog with categories and search, shopping cart management, order processing and tracking

## API Endpoints

**Auth:** `/auth/register`, `/auth/login`, `/auth/logout`  
**Products:** `/products`, `/products/{id}`  
**Categories:** `/categories`, `/categories/{id}`  
**Cart:** `/cart`, `/cart/items`, `/cart/items/{product_id}`  
**Orders:** `/orders`, `/orders/{id}`, `/orders/{id}/cancel`

## Database Tables

users, customers, sellers, admins, categories, products, shopping_carts, cart_items, orders, order_items

## Deploy

**Backend:** `gunicorn app:app`  
**Frontend:** `npm run build` (deploy dist/ folder)
