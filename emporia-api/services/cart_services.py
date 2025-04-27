class CartService:
    """Service for managing shopping carts"""
    
    def __init__(self, cart_repository, product_repository):
        self.cart_repository = cart_repository
        self.product_repository = product_repository
        
    def get_cart(self, cart_id, customer_id):
        """Get a customer's shopping cart"""
        try:
            # If no cart_id provided, try to get default cart
            if not cart_id:
                return self.get_or_create_cart(customer_id)
                
            return self.cart_repository.get_cart(cart_id, customer_id)
        except Exception as e:
            raise ValueError(f"Failed to get cart: {str(e)}")
            
    def get_or_create_cart(self, customer_id):
        """Get a customer's cart or create a new one if none exists"""
        try:
            return self.cart_repository.create_cart(customer_id)
        except Exception as e:
            raise ValueError(f"Failed to get or create cart: {str(e)}")
            
    def add_item(self, cart_id, product_id, quantity, customer_id):
        """Add an item to a cart"""
        try:
            # Validate cart belongs to customer
            cart = self.cart_repository.get_cart(cart_id, customer_id)
            if not cart:
                raise ValueError(f"Cart with ID {cart_id} not found for customer")
                
            # Validate product exists
            product = self.product_repository.get_by_id(product_id)
            if not product:
                raise ValueError(f"Product with ID {product_id} not found")
                
            # Validate quantity
            if quantity <= 0:
                raise ValueError("Quantity must be greater than zero")
                
            return self.cart_repository.add_item(cart_id, product_id, quantity)
        except Exception as e:
            raise ValueError(f"Failed to add item to cart: {str(e)}")
            
    def update_item(self, cart_id, product_id, quantity, customer_id):
        """Update an item's quantity in a cart"""
        try:
            # Validate cart belongs to customer
            cart = self.cart_repository.get_cart(cart_id, customer_id)
            if not cart:
                raise ValueError(f"Cart with ID {cart_id} not found for customer")
                
            # Validate quantity
            if quantity <= 0:
                # If quantity is zero or negative, remove the item
                return self.cart_repository.remove_item(cart_id, product_id)
                
            return self.cart_repository.update_item(cart_id, product_id, quantity)
        except Exception as e:
            raise ValueError(f"Failed to update cart item: {str(e)}")
            
    def remove_item(self, cart_id, product_id, customer_id):
        """Remove an item from a cart"""
        try:
            # Validate cart belongs to customer
            cart = self.cart_repository.get_cart(cart_id, customer_id)
            if not cart:
                raise ValueError(f"Cart with ID {cart_id} not found for customer")
                
            return self.cart_repository.remove_item(cart_id, product_id)
        except Exception as e:
            raise ValueError(f"Failed to remove item from cart: {str(e)}")
            
    def clear_cart(self, cart_id, customer_id=None):
        """Clear all items from a cart"""
        try:
            # If customer_id provided, validate cart belongs to customer
            if customer_id:
                cart = self.cart_repository.get_cart(cart_id, customer_id)
                if not cart:
                    raise ValueError(f"Cart with ID {cart_id} not found for customer")
                    
            return self.cart_repository.clear_cart(cart_id)
        except Exception as e:
            raise ValueError(f"Failed to clear cart: {str(e)}")