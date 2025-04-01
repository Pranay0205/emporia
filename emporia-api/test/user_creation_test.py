import sys
import os

# Add the project root directory to Python path
sys.path.append(os.path.abspath(os.path.dirname(os.path.dirname(__file__))))

from factories.UserFactory.UserFactory import UserFactory
from reg.User_Registry import register_all_user_types


def test_user_creation():
    # Register all user types
    register_all_user_types()
    
    # Create a factory instance
    user_factory = UserFactory()
    
    # Define the test user data
    user_data = {
        "id": 1,
        "customer_id":1,
        "first_name": "John",
        "last_name": "Doe",
        "user_name": "johndoe",
        "email": "john.doe@example.com",
        "password": "securepassword",
        "address": "123 Main St, Springfield, USA",
        "role": "customer"
    }
    admin_data = {
        "id": 2,
        "first_name": "Admin",
        "last_name": "User",
        "user_name": "adminuser",
        "email": "admin.user@example.com",
        "password": "adminpassword",
        "role": "admin",
        "admin_id": 1,
        "permissions": ["manage_users", "view_reports"]
    }
    seller_data = {
    
        "id": 3,
        "first_name": "Seller",
        "last_name": "User",
        "user_name": "selleruser",
        "email": "seller.user@example.com",
        "password": "sellerpassword",
        "role": "seller",
        "seller_id": 1,
        "store_name": "Seller's Store",
        "store_desc": "Best products in town"
    }
    
    # Create the user - passing user_type separately from the data dictionary
    print("Creating user with data:")
    print(user_data)
    print("\nResult:")
    user = user_factory.create_user("customer", **user_data)
    admin = user_factory.create_user("admin", **admin_data)
    seller = user_factory.create_user("seller", **seller_data)
    print(admin)
    print(user)
    print(seller)


if __name__ == '__main__':
    test_user_creation()