from functools import wraps
from flask import request, jsonify, current_app
from .jwt_utils import JWTManager

jwt_manager = JWTManager()

def token_required(f):
    """Decorator to require JWT token authentication"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        auth_header = request.headers.get('Authorization')
        
        if auth_header:
            try:
                # Bearer <token>
                token = auth_header.split(" ")[1]
            except IndexError:
                return jsonify({'message': 'Invalid token format'}), 401
        
        if not token:
            return jsonify({'message': 'Token is missing'}), 401
        
        payload = jwt_manager.verify_token(token)
        if not payload:
            return jsonify({'message': 'Token is invalid or expired'}), 401
        
        # Add user info to request context
        request.current_user = {
            'user_id': payload.get('user_id'),
            'role': payload.get('role'),
            'customer_id': payload.get('customer_id'),
            'seller_id': payload.get('seller_id')
        }
        
        return f(*args, **kwargs)
    return decorated

def role_required(required_role):
    """Decorator to require specific role"""
    def decorator(f):
        @wraps(f)
        @token_required
        def decorated(*args, **kwargs):
            if request.current_user.get('role') != required_role:
                return jsonify({'message': f'Access denied. {required_role} role required'}), 403
            return f(*args, **kwargs)
        return decorated
    return decorator
