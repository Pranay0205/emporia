from flask import Blueprint, current_app, request, jsonify
from utils.auth_decorators import token_required, role_required

category_bp = Blueprint('categories', __name__, url_prefix='/categories')


@category_bp.route('/', methods=['GET'])
def get_all_categories():
    """Get all categories - no authentication required"""
    try:
        categories = current_app.category_service.get_all_categories()
        return jsonify({'categories': categories}), 200
    except Exception as e:
        return jsonify({'message': f'Error retrieving categories: {str(e)}'}), 500


@category_bp.route('/<int:category_id>', methods=['GET'])
def get_category(category_id):
    """Get single category - no authentication required"""
    try:
        category = current_app.category_service.get_category_by_id(category_id)
        return jsonify({'category': category}), 200
    except ValueError as e:
        return jsonify({'message': str(e)}), 404
    except Exception as e:
        return jsonify({'message': f'Error retrieving category: {str(e)}'}), 500


@category_bp.route('/', methods=['POST'])
@role_required('admin')
def create_category():
    """Create a new category - requires admin authentication"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'message': 'No data provided'}), 400

        category_id = current_app.category_service.create_category(data)
        return jsonify({
            'message': 'Category created successfully', 
            'category_id': category_id
        }), 201
    except ValueError as e:
        return jsonify({'message': str(e)}), 400
    except Exception as e:
        return jsonify({'message': f'Error creating category: {str(e)}'}), 500


@category_bp.route('/<int:category_id>', methods=['PUT'])
@role_required('admin')
def update_category(category_id):
    """Update a category - requires admin authentication"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'message': 'No data provided'}), 400

        current_app.category_service.update_category(category_id, data)
        return jsonify({'message': f'Category with ID {category_id} updated successfully'}), 200
    except ValueError as e:
        return jsonify({'message': str(e)}), 404
    except Exception as e:
        return jsonify({'message': f'Error updating category: {str(e)}'}), 500


@category_bp.route('/<int:category_id>', methods=['DELETE'])
@role_required('admin')
def delete_category(category_id):
    """Delete a category - requires admin authentication"""
    try:
        current_app.category_service.delete_category(category_id)
        return jsonify({'message': f'Category with ID {category_id} deleted successfully'}), 200
    except ValueError as e:
        return jsonify({'message': str(e)}), 404
    except Exception as e:
        return jsonify({'message': f'Error deleting category: {str(e)}'}), 500


# emporia-api/routes/cart/cart_routes.py (Updated)
from flask import Blueprint, current_app, request, jsonify
from utils.auth_decorators import token_required, role_required

cart_bp = Blueprint('cart', __name__, url_prefix='/cart')


@cart_bp.route('/', methods=['GET'])
@role_required('customer')
def get_cart():
    """Get the current user's shopping cart"""
    try:
        customer_id = request.current_user.get('customer_id')
        if not customer_id:
            return jsonify({'message': 'Customer ID not found'}), 401

        # Get or create cart
        cart = current_app.cart_service.get_or_create_cart(customer_id)

        return jsonify({
            'cart': {
                'cart_id': cart.cart_id,
                'customer_id': cart.customer_id,
                'items': [{
                    'product_id': item.product.product_id,
                    'name': item.product.name,
                    'price': item.product.price,
                    'quantity': item.quantity,
                    'subtotal': item.product.price * item.quantity
                } for item in cart.items],
                'total_items': cart.total_items,
                'total_price': cart.total_price
            }
        }), 200
    except Exception as e:
        return jsonify({'message': f'Error retrieving cart: {str(e)}'}), 500


@cart_bp.route('/items', methods=['POST'])
@role_required('customer')
def add_to_cart():
    """Add item to cart"""
    try:
        customer_id = request.current_user.get('customer_id')
        if not customer_id:
            return jsonify({'message': 'Customer ID not found'}), 401

        data = request.get_json()
        if not data:
            return jsonify({'message': 'No data provided'}), 400

        # Add item to cart logic here
        product_id = data.get('product_id')
        quantity = data.get('quantity', 1)
        
        if not product_id:
            return jsonify({'message': 'Product ID is required'}), 400

        # Call your cart service to add item
        result = current_app.cart_service.add_item_to_cart(customer_id, product_id, quantity)
        
        return jsonify({
            'message': 'Item added to cart successfully',
            'cart': result
        }), 201
    except ValueError as e:
        return jsonify({'message': str(e)}), 400
    except Exception as e:
        return jsonify({'message': f'Error adding item to cart: {str(e)}'}), 500


@cart_bp.route('/items/<int:product_id>', methods=['PUT'])
@role_required('customer')
def update_cart_item(product_id):
    """Update cart item quantity"""
    try:
        customer_id = request.current_user.get('customer_id')
        if not customer_id:
            return jsonify({'message': 'Customer ID not found'}), 401

        data = request.get_json()
        if not data:
            return jsonify({'message': 'No data provided'}), 400

        quantity = data.get('quantity')
        if quantity is None:
            return jsonify({'message': 'Quantity is required'}), 400

        # Update cart item
        result = current_app.cart_service.update_cart_item(customer_id, product_id, quantity)
        
        return jsonify({
            'message': 'Cart updated successfully',
            'cart': result
        }), 200
    except ValueError as e:
        return jsonify({'message': str(e)}), 400
    except Exception as e:
        return jsonify({'message': f'Error updating cart: {str(e)}'}), 500


@cart_bp.route('/items/<int:product_id>', methods=['DELETE'])
@role_required('customer')
def remove_from_cart(product_id):
    """Remove item from cart"""
    try:
        customer_id = request.current_user.get('customer_id')
        if not customer_id:
            return jsonify({'message': 'Customer ID not found'}), 401

        # Remove item from cart
        result = current_app.cart_service.remove_item_from_cart(customer_id, product_id)
        
        return jsonify({
            'message': 'Item removed from cart successfully',
            'cart': result
        }), 200
    except ValueError as e:
        return jsonify({'message': str(e)}), 400
    except Exception as e:
        return jsonify({'message': f'Error removing item from cart: {str(e)}'}), 500

