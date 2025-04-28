from flask import Blueprint, current_app, request, jsonify, session

product_bp = Blueprint('products', __name__, url_prefix='/products')


@product_bp.route('/', methods=['GET'])
def get_all_products():
    """Get all products with optional pagination"""
    try:
        limit = request.args.get('limit', 100, type=int)
        offset = request.args.get('offset', 0, type=int)

        products = current_app.product_service.get_all_products(limit, offset)
        return jsonify({'products': products}), 200
    except Exception as e:
        return jsonify({'message': f'Error retrieving products: {str(e)}'}), 500


@product_bp.route('/<int:product_id>', methods=['GET'])
def get_product(product_id):
    """Get a specific product by ID"""
    try:
        product = current_app.product_service.get_product_by_id(product_id)
        return jsonify({'product': product}), 200
    except ValueError as e:
        return jsonify({'message': str(e)}), 404
    except Exception as e:
        return jsonify({'message': f'Error retrieving product: {str(e)}'}), 500


@product_bp.route('/category/<int:category_id>', methods=['GET'])
def get_products_by_category(category_id):
    """Get products by category ID"""
    try:
        products = current_app.product_service.get_products_by_category(
            category_id)
        return jsonify({'products': products}), 200
    except Exception as e:
        return jsonify({'message': f'Error retrieving products: {str(e)}'}), 500


@product_bp.route('/seller/<int:seller_id>', methods=['GET'])
def get_products_by_seller(seller_id):
    """Get products by seller ID"""
    try:
        products = current_app.product_service.get_products_by_seller(
            seller_id)
        return jsonify({'products': products}), 200
    except Exception as e:
        return jsonify({'message': f'Error retrieving products: {str(e)}'}), 500


@product_bp.route('/', methods=['POST'])
def create_product():
    """Create a new product - requires authenticated seller"""
    try:

        data = request.get_json()
        print(data)
        if not data:
            return jsonify({'message': 'No data provided'}), 400

        seller_id = session.get('seller_id')  # Get seller_id from session
        product = current_app.product_service.create_product(data, seller_id)

        return jsonify({
            'message': 'Product created successfully',
            'product': {
                'id': product.product_id,
                'name': product.name,
                'category_id': product.category_id,
                'description': product.description,
                'price': product.price,
                'stock': product.stock,
                'image': product.image,
                'seller_id': product.seller_id
            }
        }), 201
    except ValueError as e:
        return jsonify({'message': str(e)}), 400
    except Exception as e:
        return jsonify({'message': f'Error creating product: {str(e)}'}), 500


@product_bp.route('/<int:product_id>', methods=['PUT'])
def update_product(product_id):
    """Update a product - requires authenticated seller who owns the product"""
    try:
        # Check if user is authenticated and is a seller
        if not session.get('is_authenticated'):
            return jsonify({'message': 'Authentication required'}), 401

        if session.get('role') != 'seller':
            return jsonify({'message': 'Only sellers can update products'}), 403

        data = request.get_json()
        if not data:
            return jsonify({'message': 'No data provided'}), 400

        seller_id = session.get('user_id')  # Get seller_id from session
        product = current_app.product_service.update_product(
            product_id, data, seller_id)

        return jsonify({
            'message': 'Product updated successfully',
            'product': product
        }), 200
    except ValueError as e:
        # Different error codes based on the error message
        if "does not belong to seller" in str(e):
            return jsonify({'message': str(e)}), 403
        elif "not found" in str(e):
            return jsonify({'message': str(e)}), 404
        else:
            return jsonify({'message': str(e)}), 400
    except Exception as e:
        return jsonify({'message': f'Error updating product: {str(e)}'}), 500


@product_bp.route('/<int:product_id>', methods=['DELETE'])
def delete_product(product_id):
    """Delete a product - requires authenticated seller who owns the product or admin"""
    try:
        # Check if user is authenticated
        if not session.get('is_authenticated'):
            return jsonify({'message': 'Authentication required'}), 401

        # If user is admin, they can delete any product
        if session.get('role') == 'admin':
            current_app.product_service.delete_product(product_id)
        # If user is seller, they can only delete their own products
        elif session.get('role') == 'seller':
            seller_id = session.get('user_id')
            current_app.product_service.delete_product(product_id, seller_id)
        else:
            return jsonify({'message': 'Only sellers or admins can delete products'}), 403

        return jsonify({'message': f'Product with ID {product_id} deleted successfully'}), 200
    except ValueError as e:
        # Different error codes based on the error message
        if "does not belong to seller" in str(e):
            return jsonify({'message': str(e)}), 403
        elif "not found" in str(e):
            return jsonify({'message': str(e)}), 404
        else:
            return jsonify({'message': str(e)}), 400
    except Exception as e:
        return jsonify({'message': f'Error deleting product: {str(e)}'}), 500
