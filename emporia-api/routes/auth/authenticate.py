from flask import Blueprint, current_app, request, jsonify

auth_bp = Blueprint('auth', __name__, url_prefix='/auth')


@auth_bp.route('/register', methods=['POST'])
def register():
    if request.method == 'POST':
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
    else:
        return jsonify({'message': 'GET method not allowed for this endpoint'}), 405
    
    
#@auth_bp.route('/login', methods=['POST'])  # User login

#@auth_bp.route('/logout', methods=['POST'])  # User logout
      
# write a test case for the register function


