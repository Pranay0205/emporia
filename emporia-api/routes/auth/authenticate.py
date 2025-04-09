from flask import Blueprint, current_app, request, jsonify, session

auth_bp = Blueprint('auth', __name__, url_prefix='/auth')


@auth_bp.route('/register', methods=['POST'])
def register():
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
    """User login"""
    data = request.get_json()
    if not data:
        return jsonify({'message': 'No data provided'}), 400
    try:
        is_authenticated, user = current_app.user_service.authenticate_user(data["username"], data["password"])
        print("Session after authentication:", session)
        if not is_authenticated:
            raise ValueError("Invalid username or password")
                
        return jsonify({'message': 'Login successful', 'user': user}), 200
    except ValueError as e:
        return jsonify({'message': str(e)}), 401
    except Exception as e:
        return jsonify({'message': 'Login failed',
                        'error': str(e)}), 500

@auth_bp.route('/logout', methods=['POST'])  # User logout
def logout():
    """User logout"""
    print("Session before clearing:", session)
    session.clear()
    return jsonify({'message': 'Logout successful'}), 200   
# write a test case for the register function


