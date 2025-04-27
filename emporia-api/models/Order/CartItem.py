# emporia-api/models/Order/CartItem.py
class CartItem:
    def __init__(self, product, quantity):
        self.product = product
        self.quantity = quantity
        
    def __str__(self):
        return f"CartItem(product={self.product.name}, quantity={self.quantity})"