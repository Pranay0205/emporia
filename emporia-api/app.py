import re
from flask import config, request
from flask import Flask
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
import configparser
from flask_cors import CORS

app = Flask(__name__)
config = configparser.ConfigParser()
config.read('configs/config.ini')
app.secret_key = config['server']['secret_key']
CORS(app,
     resources={
         r"/*": {"origins": ["http://localhost:5173"], "supports_credentials": True}},
     allow_headers=["Content-Type", "Authorization"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])


if __name__ == '__main__':
    print("Starting the Flask app...")

    # Initialize database connection
    db = DatabaseConnection()

    # Initialize repositories
    user_repo = DBUserRepo(db)
    category_repo = DBCategoryRepo(db)
    product_repo = DBProductRepo(db)
    order_repo = DBOrderRepo(db)
    cart_repo= DBCartRepo(db)
    

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

    app.run(debug=True)
