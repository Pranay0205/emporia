from multiprocessing import Value
import re
from flask import jsonify
from factories.UserFactory.UserFactory import UserFactory
from repositories.database.db_connection import DatabaseConnection
from repositories.database.db_user_repo import DBUserRepo
from models.Users.User import User
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
      user.password = hashlib.sha256(user.password.encode("utf-8")).hexdigest() 
    
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
          id = user_data[0]
          user_name = user_data[1]
          first_name = user_data[2]
          last_name = user_data[3]
          email = user_data[4]
          role = user_data[6]
          
          user = User(id, first_name, last_name, user_name, email, None, role)
          user_json_array.append(user.to_json())
      
      return user_json_array
      
      
  
  
  def authenticate_user(self, username, password):
      pass
      # Get user from repository
      # Verify password
      # Generate token
      # return token
      
  def update_user(self, user_id, user_data):
      pass
      # Check what fields are allowed to be updated
      # Update user via repository
      # return updated_user
      
  def _validate_user(self, user_data):          
    required_fields = ["role", "first_name", "user_name", "email", "password"]
    
    for field in required_fields:
      if field not in user_data:
        raise ValueError(f"Missing required field: {field}")

    if not re.match(r"^[A-Za-z]+$", user_data['first_name']):
      raise ValueError("First name can only contain letters")
        
    if not re.match(r"^[A-Za-z]+$", user_data['last_name']):
      raise ValueError("Last name can only contain letters")
      
    if not re.match(r"^[A-Za-z0-9_]+$", user_data['user_name']):
      raise ValueError("Username can only contain letters, numbers, and underscores")
        
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

      
      
 
    
    
   
        

  
        
      
        
        
      