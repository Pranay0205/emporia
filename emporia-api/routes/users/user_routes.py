from flask import Blueprint, current_app, request, jsonify

user_bp = Blueprint('users', __name__, url_prefix='/users')


@user_bp.route('/', methods=['GET'], strict_slashes=False)
def get_all_users():

    try:
        users = current_app.user_service.get_all_users()
        return jsonify({'users': users}), 200
    except Exception as e:
        return jsonify({'message': f'Error retrieving users: {str(e)}'}), 500


@user_bp.route('/<int:user_id>', methods=['GET'], strict_slashes=False)
def get_user(user_id):

    try:
        user = current_app.user_service.get_user_by_id(user_id)
        # For now, return a placeholder response
        return user
    except ValueError as e:
        return jsonify({'message': str(e)}), 404
    except Exception as e:
        return jsonify({'message': f'Error retrieving user: {str(e)}'}), 500


@user_bp.route('/<int:user_id>', methods=['DELETE'], strict_slashes=False)
def delete_user(user_id):

    try:
        # This would call a user service
        current_app.user_service.delete_user(user_id)
        # For now, return a placeholder response
        return jsonify({'message': f'User with ID {user_id} deleted successfully'}), 200
    except ValueError as e:
        return jsonify({'message': str(e)}), 404
    except Exception as e:
        return jsonify({'message': f'Error deleting user: {str(e)}'}), 500
