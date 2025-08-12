from flask import Blueprint, current_app, request, jsonify
from utils.auth_decorators import token_required, role_required

product_bp = Blueprint('products', __name__, url_prefix='/products')


@product_bp.route('/', methods=['GET'], strict_slashes=False)
def get_all_products():
    """Get all products - no authentication required for browsing"""
    try:
        limit = request.args.get('limit', 100, type=int)
        offset = request.args.get('offset', 0, type=int)

        products = current_app.product_service.get_all_products(limit, offset)
        print(f"Retrieved {len(products)} products with limit={limit} and offset={offset}")
        return jsonify({'products': products}), 200
    except Exception as e:
        return jsonify({'message': f'Error retrieving products: {str(e)}'}), 500


@product_bp.route('/<int:product_id>', methods=['GET'], strict_slashes=False)
def get_product(product_id):
    """Get single product - no authentication required"""
    try:
        product = current_app.product_service.get_product_by_id(product_id)
        return jsonify({'product': product}), 200
    except ValueError as e:
        return jsonify({'message': str(e)}), 404
    except Exception as e:
        return jsonify({'message': f'Error retrieving product: {str(e)}'}), 500


@product_bp.route('/category/<int:category_id>', methods=['GET'], strict_slashes=False)
def get_products_by_category(category_id):
    """Get products by category - no authentication required"""
    try:
        products = current_app.product_service.get_products_by_category(category_id)
        return jsonify({'products': products}), 200
    except Exception as e:
        return jsonify({'message': f'Error retrieving products: {str(e)}'}), 500


@product_bp.route('/seller/<int:user_id>', methods=['GET'], strict_slashes=False)
def get_products_by_seller(user_id):
    """Get products by seller - no authentication required"""
    try:
        # print(f"Retrieved seller ID: {seller_id}")
        
        seller = current_app.user_service.get_seller_by_user_id(user_id)
        if not seller:
            return jsonify({'message': 'Seller not found'}), 404
        products = current_app.product_service.get_products_by_seller(seller.seller_id)
        return jsonify({'products': products}), 200
    except Exception as e:
        return jsonify({'message': f'Error retrieving products: {str(e)}'}), 500


@product_bp.route('/', methods=['POST'], strict_slashes=False)
@role_required('seller')
def create_product():
    """Create a new product - requires authenticated seller"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'message': 'No data provided'}), 400

        # Get seller info from JWT token
        seller_id = request.current_user.get('seller_id') or request.current_user.get('user_id')
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


@product_bp.route('/<int:product_id>', methods=['PUT'], strict_slashes=False)
@role_required('seller')
def update_product(product_id):
    """Update a product - requires authenticated seller who owns the product"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'message': 'No data provided'}), 400

        # Get seller info from JWT token
        seller_id = request.current_user.get('seller_id') or request.current_user.get('user_id')
        product = current_app.product_service.update_product(product_id, data, seller_id)

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


@product_bp.route('/<int:product_id>', methods=['DELETE'], strict_slashes=False)
@token_required
def delete_product(product_id):
    """Delete a product - requires authenticated seller who owns the product or admin"""
    try:
        user_role = request.current_user.get('role')
        
        # If user is admin, they can delete any product
        if user_role == 'admin':
            current_app.product_service.delete_product(product_id)
        # If user is seller, they can only delete their own products
        elif user_role == 'seller':
            seller_id = request.current_user.get('seller_id') or request.current_user.get('user_id')
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