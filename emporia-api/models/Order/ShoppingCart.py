class ShoppingCart:
    def __init__(self, customer_id: int, cart_id: int):
        self.customer_id = customer_id
        self.cart_id = cart_id
        self.items = []  # List of products
        self.total_price = 0.0
        self.total_items = 0

    def __str__(self):
        return f"ShoppingCart(customer_id={self.customer_id}, cart_id={self.cart_id}, items={self.items}, total_price={self.total_price}, total_items={self.total_items})"
