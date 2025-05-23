from multiprocessing import Value
import re
from flask import jsonify, session
from factories.UserFactory.UserFactory import UserFactory
from repositories.database.db_connection import DatabaseConnection
from repositories.database.db_user_repo import DBUserRepo
from models.Users.User import User
from models.Users.Seller import Seller  # Import the Seller class
from models.Users.Admin import Admin  # Import the Admin class
from models.Users.Customer import Customer  # Import the Customer class
import hashlib


class UserService:

    def __init__(self, user_repository):
        self.user_repository = user_repository

    def register_user(self, user_data):
        try:
            # Validate user data
            self._validate_user(user_data)

            # Create a factory instance
            user_factory = UserFactory()

            # Create a user
            user = user_factory.create_user(user_data["role"], **user_data)

            # Hash password
            user.password = hashlib.sha256(
                user.password.encode("utf-8")).hexdigest()

            # Create user
            user = self.user_repository.create(user)

            return user.id

        except Exception as e:
            raise ValueError(f"{str(e)}")

    def get_all_users(self):
        users = self.user_repository.get_all_users()

        user_json_array = []

        for user_data in users:
          # Extract fields from the array
            user = self._convert_array_to_user(user_data)

            user_json_array.append(user.to_json())

        return user_json_array

    def _convert_array_to_user(self, user_data):
        try:

            if not user_data:
                return None

            user = User(
                id=user_data[0],
                user_name=user_data[1],
                first_name=user_data[2],
                last_name=user_data[3],
                email=user_data[4],
                password=user_data[5],
                role=user_data[6]
            )
            return user

        except Exception as e:
            raise ValueError(f"Failed to convert array to user: {str(e)}")

    def _convert_array_to_seller(self, user_data, user):
        try:
            if not user_data:
                return None
            user = Seller(
                id=user.id,
                first_name=user.first_name,
                last_name=user.last_name,
                user_name=user.user_name,
                email=user.email,
                password=user.password,
                role=user.role,
                seller_id=user_data[0],
                store_name=user_data[1],
                store_desc=user_data[2]
            )
            return user

        except Exception as e:
            raise ValueError(f"Failed to convert array to Seller: {str(e)}")

    def _convert_array_to_admin(self, user_data, user):
        try:

            if not user_data:
                return None

            user = Admin(
                id=user.id,
                first_name=user.first_name,
                last_name=user.last_name,
                user_name=user.user_name,
                email=user.email,
                password=user.password,
                role=user.role,
                admin_id=user_data[0],
                permissions=user_data[1]
            )
            return user

        except Exception as e:
            raise ValueError(f"Failed to convert array to Admin: {str(e)}")

    def _convert_array_to_customer(self, user_data, user):
        try:

            if not user_data:
                return None

            user = Customer(
                id=user.id,
                first_name=user.first_name,
                last_name=user.last_name,
                user_name=user.user_name,
                email=user.email,
                password=user.password,
                role=user.role,
                customer_id=user_data[0],
                address=user_data[1],
                phone_number=user_data[2]
            )
            return user

        except Exception as e:
            raise ValueError(f"Failed to convert array to Admin: {str(e)}")

    def authenticate_user(self, username, password):

        # Get user from repository
        is_authenticated = False
        try:
            if username == None or password == None:
                raise ValueError("Username and password cannot be None")

            if username == "" or password == "":
                raise ValueError("Username and password cannot be empty")

            raw_user = self.user_repository.get_user_by_username(username)

            if not raw_user:
                raise ValueError("User not found")

            user = self._convert_array_to_user(raw_user)

            print(user.to_json())
            # Hash the provided password
            hashed_password = hashlib.sha256(
                password.encode("utf-8")).hexdigest()

            # Verify password
            if user.password != hashed_password:
                raise ValueError("Invalid password")
            else:
                is_authenticated = True
                session['is_authenticated'] = True
                session['role'] = user.role
                session['user_id'] = user.id

                if user.role == 'seller':
                    seller = self.user_repository.get_seller_by_username(
                        user.id)
                    print(seller)
                    seller = self._convert_array_to_seller(seller, user)
                    session['seller_id'] = seller.seller_id
                elif (user.role == 'admin'):
                    admin = self.user_repository.get_admin_by_username(user.id)
                    admin = self._convert_array_to_admin(admin, user)
                    session['admin_id'] = admin.admin_id
                elif (user.role == 'customer'):
                    customer = self.user_repository.get_customer_by_username(
                        user.id)
                    customer = self._convert_array_to_customer(customer, user)
                    session['customer_id'] = customer.customer_id
                else:
                    raise ValueError("Invalid role")

            return is_authenticated, user.to_json()

        except ValueError as e:
            raise ValueError(f"DJlkfjsdkljflk: {str(e)}")
        except Exception as e:
            raise ValueError(f"Authentication failed: {str(e)}")

    def get_user(self, username):
        user = self.user_repository.get_user_by_username(username)
        if not user:
            raise ValueError("User not found")
        return user

    def _validate_user(self, user_data):
        required_fields = ["role", "first_name",
                           "user_name", "email", "password"]

        for field in required_fields:
            if field not in user_data:
                raise ValueError(f"Missing required field: {field}")

        if not re.match(r"^[A-Za-z]+$", user_data['first_name']):
            raise ValueError("First name can only contain letters")

        if not re.match(r"^[A-Za-z]+$", user_data['last_name']):
            raise ValueError("Last name can only contain letters")

        if not re.match(r"^[A-Za-z0-9_]+$", user_data['user_name']):
            raise ValueError(
                "Username can only contain letters, numbers, and underscores")

        if not re.match(r"[^@]+@[^@]+\.[^@]+", user_data['email']):
            raise ValueError("Invalid email format")

        if len(user_data['password']) < 8:
            raise ValueError("Password must be at least 8 characters")

        # Role-specific validations

        # Customer
        if user_data['role'] == 'customer':
            if 'address' not in user_data:
                raise ValueError("Address is required for customers")

            if 'phone_number' not in user_data:
                raise ValueError("Phone is required for customers")

        # Seller
        if user_data['role'] == 'seller':
            if 'store_name' not in user_data:
                raise ValueError("Store Name is required for sellers")

            if 'store_desc' not in user_data:
                raise ValueError("Store Description is required for sellers")

        # Admin
        if user_data['role'] == 'admin':
            if 'permissions' not in user_data:
                raise ValueError("Permissions are required for admins")
