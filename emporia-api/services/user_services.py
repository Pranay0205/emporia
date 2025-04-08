from multiprocessing import Value
import re
from flask import jsonify
from factories import UserFactory
from repositories.database.db_connection import DatabaseConnection
from repositories.database.db_user_repo import DBUserRepo
import hashlib


class UserService:
  
  def __init__(self, user_repository):
    self.user_repository = user_repository
  
  def register_user(self, user_data):
    try:
      # Validate user data
      self._validate_user(user_data)
      
      user = UserFactory.create_user(user_data['role'], **user_data)
           
      # Hash password
      user.password = hashlib.sha256(user.password.encode("utf-8")) 
    
      # Send welcome email
      print(f"{user.first_name} user is created! Welcome!")

      # Create db connection
      db = DatabaseConnection()
      
      # Create User Repo
      # user_repo = DBUserRepo(db)
      
      # # Create user
      # user = self.user_repository.create(user)
      
      return user.id
            
    except Exception as error:
        print(f"{error}")
      
  
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
    required_fields = ["user_type", "first_name", "user_name", "email", "password"]
    
    for field in required_fields:
      if field not in user_data:
        raise ValueError(f"Missing required field: {field}")
      
    if not re.match(r"[^@]+@[^@]+\.[^@]+", user_data['email']):
        raise ValueError("Invalid email format")
    
    # Password strength validation
    
    if 'password' in user_data:
      if len(user_data['password']) < 8:
        raise ValueError("Password must be at least 8 characters")
    else:
        raise ValueError("Password is required")
      
    # Role-specific validations
    
    # Customer
    if user_data['role'] == 'customer':
        if 'address' not in user_data:
          raise ValueError("Address is required for customers")
      
        if 'phone' not in user_data:
          raise ValueError("Phone is required for customers")    
      
    # Seller
    if user_data['role'] == 'seller':
      if 'store_name' not in user_data:
        raise ValueError("Store Name is required for sellers")
      
      if 'store_desc' not in user_data:
        raise ValueError("Store Description is required for sellers")
        
    # Admin
    if user_data['permissions'] == 'admin': 
      if 'permissions' not in user_data:
        raise ValueError("Permissions are required for admins")

      
      
 
    
    
   
        

  
        
      
        
        
      