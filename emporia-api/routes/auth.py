from flask import Blueprint, request, jsonify
from factory.UserFactory import UserFactory

auth_bp = Blueprint('auth', __name__, url_prefix='/auth')


@auth_bp.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        data = request.get_json()
        if not data:
            return jsonify({'message': 'No data provided'}), 400

        user = UserFactory.create_user(data['user_type'], **data)

        print(f"User created: {user}")

    else:
        return jsonify({'message': 'GET method not allowed for this endpoint'}), 405
      
      
# write a test case for the register function


