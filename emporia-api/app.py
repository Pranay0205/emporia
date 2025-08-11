# emporia-api/app.py
import os
from flask import Flask
from dotenv import load_dotenv
from flask_cors import CORS

# Import your existing modules
from reg import User_Registry
from repositories.database.db_connection import DatabaseConnection
from repositories.database.db_user_repo import DBUserRepo
from repositories.database.db_category_repo import DBCategoryRepo
from repositories.database.db_product_repo import DBProductRepo
from services.user_services import UserService
from services.category_services import CategoryService
from services.product_services import ProductService
from repositories.database.db_order_repo import DBOrderRepo
from services.order_services import OrderService
from services.payment_services import PaymentService
from services.cart_services import CartService
from repositories.database.db_cart_repo import DBCartRepo
from routes import register_blueprints

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Basic Flask configuration (removed all session-related config)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')

# JWT Configuration (these will be used by the JWT utility)
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = int(os.getenv('ACCESS_TOKEN_EXPIRE_MINUTES', 30))

# CORS configuration - allow credentials removed since we're using JWT in headers
CORS(app, 
     origins=["http://localhost:5173", "http://127.0.0.1:5173"],
     allow_headers=["Content-Type", "Authorization"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])

if __name__ == '__main__':
    print("Starting the Flask app with JWT authentication...")

    # Initialize database connection
    db = DatabaseConnection()

    # Initialize repositories
    user_repo = DBUserRepo(db)
    category_repo = DBCategoryRepo(db)
    product_repo = DBProductRepo(db)
    order_repo = DBOrderRepo(db)
    cart_repo = DBCartRepo(db)

    # Initialize services
    user_service = UserService(user_repo)
    category_service = CategoryService(category_repo)
    product_service = ProductService(product_repo)
    payment_service = PaymentService()
    order_service = OrderService(order_repo, product_repo, payment_service)
    cart_service = CartService(cart_repo, product_repo)

    # Add services to app context
    app.user_service = user_service
    app.category_service = category_service
    app.product_service = product_service
    app.order_service = order_service
    app.cart_service = cart_service
    app.payment_service = payment_service

    # Register all blueprints
    register_blueprints(app)

    # Register user types
    User_Registry.register_all_user_types()

    print("✅ JWT Authentication configured")
    print("✅ Flask app ready to serve requests")
    
    app.run(debug=True)