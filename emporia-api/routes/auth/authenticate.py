from flask import Blueprint, current_app, request, jsonify
from utils.auth_decorators import token_required

auth_bp = Blueprint('auth', __name__, url_prefix='/auth')

@auth_bp.route('/register', methods=['POST'])
def register():
    """User registration"""
    data = request.get_json()
    if not data:
        return jsonify({'message': 'No data provided'}), 400
    try:
        user_id = current_app.user_service.register_user(data)
        return jsonify({'message': 'User registered successfully', 'user_id': user_id}), 201
    except ValueError as e:
        return jsonify({'message': str(e)}), 400
    except Exception as e:
        return jsonify({'message': 'Registration failed'}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    """User login with JWT token"""
    data = request.get_json()
    if not data:
        return jsonify({'message': 'No data provided'}), 400
    
    try:
        is_authenticated, auth_data = current_app.user_service.authenticate_user(
            data.get("username"), 
            data.get("password")
        )
        
        if not is_authenticated:
            return jsonify({'message': 'Authentication failed'}), 401
            
        return jsonify({
            'message': 'Login successful',
            'access_token': auth_data['access_token'],
            'token_type': auth_data['token_type'],
            'user': auth_data['user']
        }), 200
        
    except ValueError as e:
        return jsonify({'message': str(e)}), 401
    except Exception as e:
        return jsonify({'message': 'Login failed', 'error': str(e)}), 500

@auth_bp.route('/logout', methods=['POST'])
@token_required
def logout():
    """User logout (token invalidation handled client-side)"""
    return jsonify({'message': 'Logout successful'}), 200

@auth_bp.route('/verify-token', methods=['GET'])
@token_required
def verify_token():
    """Verify if token is valid"""
    return jsonify({
        'message': 'Token is valid',
        'user': request.current_user
    }), 200
