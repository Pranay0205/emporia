# emporia-api/repositories/interfaces/order_repo.py
from abc import abstractmethod

class OrderRepository:
    def __init__(self, db):
        self.db = db
      
    @abstractmethod
    def create_order(self, order):
        """Create a new order in the database"""
        pass
      
    @abstractmethod
    def get_by_id(self, order_id):
        """Fetch an order by its ID"""
        pass
      
    @abstractmethod
    def get_by_customer(self, customer_id):
        """Fetch orders by customer ID"""
        pass
  
    @abstractmethod
    def update_order(self, order):
        """Update an existing order"""
        pass

    @abstractmethod
    def delete_order(self, order_id):
        """Delete an order"""
        pass