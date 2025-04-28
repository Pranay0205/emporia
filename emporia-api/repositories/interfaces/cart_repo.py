# emporia-api/repositories/interfaces/cart_repo.py
from abc import abstractmethod


class CartRepository:
    def __init__(self, db):
        self.db = db

    @abstractmethod
    def get_cart(self, cart_id, customer_id):
        """Get a shopping cart by ID and customer"""
        pass

    @abstractmethod
    def create_cart(self, customer_id):
        """Create a new shopping cart"""
        pass

    @abstractmethod
    def add_item(self, cart_id, product_id, quantity):
        """Add an item to a cart"""
        pass

    @abstractmethod
    def update_item(self, cart_id, product_id, quantity):
        """Update an item's quantity in a cart"""
        pass

    @abstractmethod
    def remove_item(self, cart_id, product_id):
        """Remove an item from a cart"""
        pass

    @abstractmethod
    def clear_cart(self, cart_id):
        """Clear all items from a cart"""
        pass
