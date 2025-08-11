from flask import Blueprint, current_app, request, jsonify, session
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
    try:
        # Check if user is authenticated
        
        customer_id = request.current_user.get('customer_id')
        if not customer_id:
            return jsonify({'message': 'Customer ID not found'}), 40

        data = request.get_json()

        if not data:
            return jsonify({'message': 'No data provided'}), 400

        product_id = data.get('product_id')
        quantity = data.get('quantity', 1)
        
        if not product_id:
            return jsonify({'message': 'Product ID is required'}), 400

        customer_id = session.get('customer_id')

        # Get or create cart
        cart = current_app.cart_service.get_or_create_cart(customer_id)

        # Add item to cart
        updated_cart = current_app.cart_service.add_item(
            cart.cart_id,
            product_id,
            quantity,
            customer_id
        )

        return jsonify({
            'message': 'Item added to cart',
            'cart': {
                'cart_id': updated_cart.cart_id,
                'customer_id': updated_cart.customer_id,
                'items': [{
                    'product_id': item.product.product_id,
                    'name': item.product.name,
                    'price': item.product.price,
                    'quantity': item.quantity,
                    'subtotal': item.product.price * item.quantity
                } for item in updated_cart.items],
                'total_items': updated_cart.total_items,
                'total_price': updated_cart.total_price
            }
        }), 200
    except ValueError as e:
        return jsonify({'message': str(e)}), 400
    except Exception as e:
        return jsonify({'message': f'Error adding item to cart: {str(e)}'}), 500


@cart_bp.route('/items/<int:product_id>', methods=['PUT'])
@role_required('customer')
def update_cart_item(product_id):
    """Update an item's quantity in the shopping cart"""
    try:
        # Check if user is authenticated
        customer_id = request.current_user.get('customer_id')
        if not customer_id:
            return jsonify({'message': 'Customer ID not found'}), 40

        data = request.get_json()
        if not data:
            return jsonify({'message': 'No data provided'}), 400

        quantity = data.get('quantity')

        if quantity is None:
            return jsonify({'message': 'Quantity is required'}), 400

        customer_id = session.get('customer_id')

        # Get cart
        cart = current_app.cart_service.get_or_create_cart(customer_id)

        # Update item in cart
        updated_cart = current_app.cart_service.update_item(
            cart.cart_id,
            product_id,
            quantity,
            customer_id
        )

        return jsonify({
            'message': 'Cart item updated',
            'cart': {
                'cart_id': updated_cart.cart_id,
                'customer_id': updated_cart.customer_id,
                'items': [{
                    'product_id': item.product.product_id,
                    'name': item.product.name,
                    'price': item.product.price,
                    'quantity': item.quantity,
                    'subtotal': item.product.price * item.quantity
                } for item in updated_cart.items],
                'total_items': updated_cart.total_items,
                'total_price': updated_cart.total_price
            }
        }), 200
    except ValueError as e:
        return jsonify({'message': str(e)}), 400
    except Exception as e:
        return jsonify({'message': f'Error updating cart item: {str(e)}'}), 500


@cart_bp.route('/items/<int:product_id>', methods=['DELETE'])
@role_required('customer')
def remove_from_cart(product_id):

    try:
        # Check if user is authenticated
        customer_id = request.current_user.get('customer_id')
        if not customer_id:
            return jsonify({'message': 'Customer ID not found'}), 40

        # Get cart
        cart = current_app.cart_service.get_or_create_cart(customer_id)

        # Remove item from cart
        updated_cart = current_app.cart_service.remove_item(
            cart.cart_id,
            product_id,
            customer_id
        )

        return jsonify({
            'message': 'Item removed from cart',
            'cart': {
                'cart_id': updated_cart.cart_id,
                'customer_id': updated_cart.customer_id,
                'items': [{
                    'product_id': item.product.product_id,
                    'name': item.product.name,
                    'price': item.product.price,
                    'quantity': item.quantity,
                    'subtotal': item.product.price * item.quantity
                } for item in updated_cart.items],
                'total_items': updated_cart.total_items,
                'total_price': updated_cart.total_price
            }
        }), 200
    except ValueError as e:
        return jsonify({'message': str(e)}), 400
    except Exception as e:
        return jsonify({'message': f'Error removing item from cart: {str(e)}'}), 500


@cart_bp.route('/', methods=['DELETE'])
@role_required('customer')
def clear_cart():

    try:
        # Check if user is authenticated
        customer_id = request.current_user.get('customer_id')
        if not customer_id:
            return jsonify({'message': 'Customer ID not found'}), 40

        # Get cart
        cart = current_app.cart_service.get_or_create_cart(customer_id)

        # Clear cart
        empty_cart = current_app.cart_service.clear_cart(
            cart.cart_id, customer_id)

        return jsonify({
            'message': 'Cart cleared',
            'cart': {
                'cart_id': empty_cart.cart_id,
                'customer_id': empty_cart.customer_id,
                'items': [],
                'total_items': 0,
                'total_price': 0
            }
        }), 200
    except ValueError as e:
        return jsonify({'message': str(e)}), 400
    except Exception as e:
        return jsonify({'message': f'Error clearing cart: {str(e)}'}), 500
