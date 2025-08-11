from flask import Blueprint, current_app, request, jsonify
from utils.auth_decorators import token_required, role_required

category_bp = Blueprint('categories', __name__, url_prefix='/categories')


@category_bp.route('/', methods=['GET'], strict_slashes=False)
def get_all_categories():
    """Get all categories - no authentication required"""
    try:
        categories = current_app.category_service.get_all_categories()
        return jsonify({'categories': categories}), 200
    except Exception as e:
        return jsonify({'message': f'Error retrieving categories: {str(e)}'}), 500


@category_bp.route('/<int:category_id>', methods=['GET'], strict_slashes=False)
def get_category(category_id):
    """Get single category - no authentication required"""
    try:
        category = current_app.category_service.get_category_by_id(category_id)
        return jsonify({'category': category}), 200
    except ValueError as e:
        return jsonify({'message': str(e)}), 404
    except Exception as e:
        return jsonify({'message': f'Error retrieving category: {str(e)}'}), 500


@category_bp.route('/', methods=['POST'], strict_slashes=False)
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


@category_bp.route('/<int:category_id>', methods=['PUT'], strict_slashes=False)
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


@category_bp.route('/<int:category_id>', methods=['DELETE'], strict_slashes=False)
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

