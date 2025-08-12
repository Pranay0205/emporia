from flask import Blueprint, current_app, request, jsonify
from utils.auth_decorators import token_required, role_required

cart_bp = Blueprint('cart', __name__, url_prefix='/cart')


@cart_bp.route('/', methods=['GET'], strict_slashes=False)
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


@cart_bp.route('/items', methods=['POST'], strict_slashes=False)
@role_required('customer')
def add_to_cart():
    """Add an item to the shopping cart"""
    try:
        customer_id = request.current_user.get('customer_id')
        if not customer_id:
            return jsonify({'message': 'Customer ID not found'}), 401

        # --- MORE DEBUGGING ADDED ---
        # Print the raw request body to the server console to see exactly what is being sent.
        raw_data = request.data
        print(f"DEBUG: Raw request data received: {raw_data}")

        # Use force=True to bypass potential mimetype/header issues during JSON parsing.
        data = request.get_json(force=True)
        print(f"DEBUG: Parsed JSON data: {data}")
        
        if not data:
            return jsonify({'message': 'No JSON data provided in the request body'}), 400

        product_id = data.get('product_id')
        quantity = data.get('quantity', 1)
        
        # A more robust check to see if the key is missing
        if product_id is None:
            return jsonify({
                'message': '[Debug] "product_id" key is missing or null in the request body.',
                'received_data': data,
                'raw_data_decoded': raw_data.decode('utf-8') # Return the raw data in the error response
            }), 400

        # Get or create cart for the authenticated customer
        cart = current_app.cart_service.get_or_create_cart(customer_id)

        # Add item to cart using the service
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


@cart_bp.route('/items/<int:product_id>', methods=['PUT'], strict_slashes=False)
@role_required('customer')
def update_cart_item(product_id):
    """Update an item's quantity in the shopping cart"""
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


@cart_bp.route('/items/<int:product_id>', methods=['DELETE'], strict_slashes=False)
@role_required('customer')
def remove_from_cart(product_id):
    """Remove an item from the shopping cart"""
    try:
        customer_id = request.current_user.get('customer_id')
        if not customer_id:
            return jsonify({'message': 'Customer ID not found'}), 401

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


@cart_bp.route('/', methods=['DELETE'], strict_slashes=False)
@role_required('customer')
def clear_cart():
    """Clear all items from the shopping cart"""
    try:
        customer_id = request.current_user.get('customer_id')
        if not customer_id:
            return jsonify({'message': 'Customer ID not found'}), 401

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
