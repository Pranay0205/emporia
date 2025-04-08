from flask import Blueprint, request, jsonify
from services.user_services import UserService

auth_bp = Blueprint('auth', __name__, url_prefix='/auth')


@auth_bp.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        data = request.get_json()
        if not data:
            return jsonify({'message': 'No data provided'}), 400
        
        
        
    
    else:
        return jsonify({'message': 'GET method not allowed for this endpoint'}), 405
    
    
#@auth_bp.route('/login', methods=['POST'])  # User login

#@auth_bp.route('/logout', methods=['POST'])  # User logout
      
# write a test case for the register function


