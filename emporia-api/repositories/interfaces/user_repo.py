from abc import abstractmethod

class UserRepository:
    def __init__(self, db):
        self.db = db
      
    @abstractmethod
    def get_all_users(self):
        """
        Fetch all users from the database.
        """
        pass
      
    @abstractmethod
    def get_by_id(self, user_id):
        """
        Fetch a user by their ID from the database.
        """
        pass
      
    @abstractmethod
    def get_user_by_username(self, username):
        """
        Fetch a user by their username from the database.
        """
        pass
      
    @abstractmethod
    def get_by_role(self, role):
        """
        Fetch a user by their role from the database.
        """
        pass
      
    @abstractmethod
    def get_by_email(self, email):
        """
        Fetch a user by their email from the database.
        """
        pass
  
    @abstractmethod
    def create(self, user_data):
        """
        Create a new user in the database.
        """
        pass

    @abstractmethod
    def update(self, user_id, user_data):
        """
        Update an existing user in the database.
        """
        pass

    @abstractmethod
    def delete(self, user_id):
        """
        Delete a user from the database.
        """
        pass
      
    
    
      
      
      
      