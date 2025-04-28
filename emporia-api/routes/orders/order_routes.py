# emporia-api/routes/orders/order_routes.py
from flask import Blueprint, current_app, request, jsonify, session

order_bp = Blueprint('orders', __name__, url_prefix='/orders')


@order_bp.route('/', methods=['POST'])
def place_order():
    """Place a new order"""
    try:
        # Check if user is authenticated
        if not session.get('is_authenticated'):
            return jsonify({'message': 'Authentication required'}), 401

        data = request.get_json()
        print(data)
        if not data:
            return jsonify({'message': 'No data provided'}), 400

        customer_id = session.get('customer_id')
        cart_id = data.get('cart_id')
        payment_method = data.get('payment_method')

        # Get shopping cart
        shopping_cart = current_app.cart_service.get_cart(cart_id, customer_id)

        # Place order
        result = current_app.order_service.place_order(
            shopping_cart,
            customer_id,
            payment_method
        )

        print("Result from order service:", result)
        if result['success']:
            # Clear the cart after successful order
            current_app.cart_service.clear_cart(cart_id)

            return jsonify({
                'message': result['message'],
                'order_id': result['order_id']
            }), 201
        else:
            return jsonify({'message': result['message']}), 400

    except ValueError as e:
        return jsonify({'message': str(e)}), 400
    except Exception as e:
        return jsonify({'message': f'Error placing order: {str(e)}'}), 500


@order_bp.route('/', methods=['GET'])
def get_customer_orders():
    """Get all orders for the authenticated customer"""
    try:
        # Check if user is authenticated
        if not session.get('is_authenticated'):
            return jsonify({'message': 'Authentication required'}), 401

        customer_id = session.get('customer_id')

        # Get all orders for customer
        orders = current_app.order_service.get_customer_orders(customer_id)

        return jsonify({'orders': orders}), 200
    except Exception as e:
        return jsonify({'message': f'Error retrieving orders: {str(e)}'}), 500


@order_bp.route('/<int:order_id>', methods=['GET'])
def get_order(order_id):
    """Get a specific order by ID"""
    try:
        # Check if user is authenticated
        if not session.get('is_authenticated'):
            return jsonify({'message': 'Authentication required'}), 401

        customer_id = session.get('customer_id')

        # Get order
        order = current_app.order_service.get_order(order_id, customer_id)

        if not order:
            return jsonify({'message': f'Order with ID {order_id} not found'}), 404

        return jsonify({'order': order}), 200
    except Exception as e:
        return jsonify({'message': f'Error retrieving order: {str(e)}'}), 500


@order_bp.route('/<int:order_id>/cancel', methods=['POST'])
def cancel_order(order_id):
    """Cancel an order"""
    try:
        # Check if user is authenticated
        if not session.get('is_authenticated'):
            return jsonify({'message': 'Authentication required'}), 401

        customer_id = session.get('customer_id')

        # Cancel order
        result = current_app.order_service.cancel_order(order_id, customer_id)

        if result['success']:
            return jsonify({'message': result['message']}), 200
        else:
            return jsonify({'message': result['message']}), 400
    except Exception as e:
        return jsonify({'message': f'Error cancelling order: {str(e)}'}), 500
