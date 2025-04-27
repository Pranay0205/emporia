from command.order_invoker import OrderInvoker
from command.order_commands import (
    ValidateOrderCommand,
    CreateOrderCommand,
    UpdateInventoryCommand,
    ProcessPaymentCommand,
    UpdateOrderStatusCommand
)

class OrderService:
    """Service class for handling order operations using command pattern"""
    
    def __init__(self, order_repository, product_repository, payment_service):
        self.order_repository = order_repository
        self.product_repository = product_repository
        self.payment_service = payment_service
        self.invoker = OrderInvoker()
        
    def place_order(self, shopping_cart, customer_id, payment_method):
        """Place a new order using the command pattern"""
        try:
            # Create all commands in sequence
            validate_command = ValidateOrderCommand(shopping_cart, customer_id)
            create_order_command = CreateOrderCommand(
                self.order_repository,
                customer_id,
                shopping_cart.items,
                shopping_cart.total_price
            )
            update_inventory_command = UpdateInventoryCommand(
                self.product_repository,
                shopping_cart.items
            )
            
            # Execute initial commands
            self.invoker.execute_command(validate_command)
            order = self.invoker.execute_command(create_order_command)
            self.invoker.execute_command(update_inventory_command)
            
            # Process payment
            payment_command = ProcessPaymentCommand(
                self.payment_service,
                order,
                payment_method
            )
            self.invoker.execute_command(payment_command)
            
            # Update order status to "paid"
            update_status_command = UpdateOrderStatusCommand(
                self.order_repository,
                order.order_id,
                "paid"
            )
            self.invoker.execute_command(update_status_command)
            
            return {
                "success": True,
                "message": "Order placed successfully",
                "order_id": order.order_id
            }
            
        except Exception as e:
            # If any command fails, the invoker will automatically roll back
            return {
                "success": False,
                "message": f"Order placement failed: {str(e)}"
            }
    
    def cancel_order(self, order_id, customer_id=None):
        """Cancel an existing order"""
        try:
            order = self.order_repository.get_by_id(order_id)
            if not order:
                return {
                    "success": False,
                    "message": f"Order with ID {order_id} not found"
                }
            
            if customer_id and order.customer_id != customer_id:
                return {
                    "success": False,
                    "message": "You do not have permission to cancel this order"
                }
            update_status_command = UpdateOrderStatusCommand(
                self.order_repository,
                order_id,
                "cancelled"
            )
            self.invoker.execute_command(update_status_command)
            
            # Could add additional commands for refund processing, inventory restoration, etc.
            
            return {
                "success": True,
                "message": "Order cancelled successfully"
            }
        except Exception as e:
            return {
                "success": False,
                "message": f"Order cancellation failed: {str(e)}"
            }
    
    def get_customer_orders(self, customer_id):
        """Get all orders for a customer"""
        try:
            orders= self.order_repository.get_orders_by_customer(customer_id)
            # Convert to dictionary for API response
            return [{
                'order_id': order.order_id,
                'date': order.date.strftime('%Y-%m-%d %H:%M:%S') if order.date else None,
                'status': order.status,
                'total_amount': order.amount,
                'items': [{
                    'product_id': item.product.product_id,
                    'name': item.product.name,
                    'price': item.product.price,
                    'quantity': item.quantity,
                    'subtotal': item.product.price * item.quantity
                } for item in order.product_list]
            } for order in orders]
        
        except Exception as e:
            raise ValueError(f"Failed to fetch customer orders: {str(e)}")

    def get_order(self, order_id, customer_id=None):
        """Get a specific order by ID"""
        try:
            # Get order
            order = self.order_repository.get_by_id(order_id)
            if not order:
                return None
            # If customer_id provided, validate order belongs to customer
            if customer_id and order.customer_id != customer_id:
                # For security, don't reveal that the order exists
                return None
                
            # Convert to dictionary for API response
            return {
                'order_id': order.order_id,
                'date': order.date.strftime('%Y-%m-%d %H:%M:%S') if order.date else None,
                'status': order.status,
                'total_amount': order.amount,
                'items': [{
                    'product_id': item.product.product_id,
                    'name': item.product.name,
                    'price': item.product.price,
                    'quantity': item.quantity,
                    'subtotal': item.product.price * item.quantity
                } for item in order.product_list]
            }
            
        except Exception as e:
            raise ValueError(f"Failed to fetch order: {str(e)}")
        