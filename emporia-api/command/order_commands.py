# emporia-api/patterns/command/order_commands.py
from datetime import datetime
from command.order_command import OrderCommand
from models.Order.Order import Order

class ValidateOrderCommand(OrderCommand):
    """Command to validate an order before processing"""
    
    def __init__(self, shopping_cart, customer_id):
        self.shopping_cart = shopping_cart
        self.customer_id = customer_id
        self.is_valid = False
        
    def execute(self):
        # Check if cart is not empty
        if not self.shopping_cart.items or len(self.shopping_cart.items) == 0:
            raise ValueError("Shopping cart is empty")
            
        # Check if all products have sufficient stock
        for item in self.shopping_cart.items:
            if item.product.stock < item.quantity:
                raise ValueError(f"Insufficient stock for product: {item.product.name}")
                
        # Check if customer exists and is valid
        if not self.customer_id:
            raise ValueError("Invalid customer")
            
        self.is_valid = True
        return True
        
    def undo(self):
        # Validation doesn't need undo operation
        self.is_valid = False
        pass

class CreateOrderCommand(OrderCommand):
    """Command to create an order record in the database"""
    
    def __init__(self, order_repository, customer_id, product_list, amount):
        self.order_repository = order_repository
        self.customer_id = customer_id
        self.product_list = product_list
        self.amount = amount
        self.order = None
        
    def execute(self):
        # Create a new order
        order = Order(
            order_id=None,  # Will be assigned by database
            customer_id=self.customer_id,
            product_list=self.product_list,
            amount=self.amount,
            status="pending",
            date=datetime.now()
        )
        
        # Save order to database
        self.order = self.order_repository.create_order(order)
        return self.order
        
    def undo(self):
        # Delete the order if it was created
        if self.order and self.order.order_id:
            self.order_repository.delete_order(self.order.order_id)
            self.order = None

class UpdateInventoryCommand(OrderCommand):
    """Command to update product inventory after order creation"""
    
    def __init__(self, product_repository, product_list):
        self.product_repository = product_repository
        self.product_list = product_list
        self.original_stock = {}
        
    def execute(self):
        # Save original stock for potential rollback
        for item in self.product_list:
            product_id = item.product.product_id
            quantity = item.quantity
            self.original_stock[product_id] = item.product.stock
            
            # Update stock
            new_stock = item.product.stock - quantity
            if new_stock < 0:
                raise ValueError(f"Insufficient stock for product: {item.product.name}")
                
            item.product.stock = new_stock
            self.product_repository.update(item.product)
            
        return True
        
    def undo(self):
        # Restore original stock values
        for product_id, original_stock in self.original_stock.items():
            product = self.product_repository.get_by_id(product_id)
            if product:
                product.stock = original_stock
                self.product_repository.update(product)

class ProcessPaymentCommand(OrderCommand):
    """Command to process payment for an order"""
    
    def __init__(self, payment_service, order, payment_method):
        self.payment_service = payment_service
        self.order = order
        self.payment_method = payment_method
        self.payment_id = None
        
    def execute(self):
        # Process payment
        payment_result = self.payment_service.process_payment(
            amount=self.order.amount,
            payment_method=self.payment_method,
            order_id=self.order.order_id
        )
        
        if payment_result.success:
            self.payment_id = payment_result.payment_id
            return True
        else:
            raise ValueError(f"Payment failed: {payment_result.error_message}")
        
    def undo(self):
        # Refund the payment if it was processed
        if self.payment_id:
            self.payment_service.refund_payment(self.payment_id)
            self.payment_id = None

class UpdateOrderStatusCommand(OrderCommand):
    """Command to update order status"""
    
    def __init__(self, order_repository, order_id, new_status):
        self.order_repository = order_repository
        self.order_id = order_id
        self.new_status = new_status
        self.previous_status = None
        
    def execute(self):
        # Get current order
        order = self.order_repository.get_by_id(self.order_id)
        if not order:
            raise ValueError(f"Order with ID {self.order_id} not found")
            
        # Save previous status for potential rollback
        self.previous_status = order.status
        
        # Update status
        order.status = self.new_status
        self.order_repository.update_order(order)
        return True
        
    def undo(self):
        # Restore previous status
        if self.previous_status:
            order = self.order_repository.get_by_id(self.order_id)
            if order:
                order.status = self.previous_status
                self.order_repository.update_order(order)