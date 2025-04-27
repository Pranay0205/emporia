# Import all blueprints
from routes.auth.authenticate import auth_bp
from routes.users.user_routes import user_bp
from routes.categories.category_routes import category_bp
from routes.products.product_routes import product_bp
from routes.orders.order_routes import order_bp
from routes.cart.cart_routes import cart_bp

# Function to register all blueprints with the Flask app
def register_blueprints(app):
    app.register_blueprint(auth_bp)
    app.register_blueprint(user_bp)
    app.register_blueprint(category_bp)
    app.register_blueprint(product_bp)
    app.register_blueprint(order_bp)
    app.register_blueprint(cart_bp)
    
    print("All route blueprints registered successfully")