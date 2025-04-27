# emporia-api/services/payment_service.py
class PaymentResult:
    def __init__(self, success, payment_id=None, error_message=None):
        self.success = success
        self.payment_id = payment_id
        self.error_message = error_message

class PaymentService:
    """Service to handle payment processing"""
    
    def process_payment(self, amount, payment_method, order_id):
        """Process a payment for an order"""
        try:
            # In a real implementation, this would integrate with a payment gateway
            # For demonstration purposes, we'll simulate a successful payment
            
            # Simulate payment processing
            payment_id = f"PAYMENT-{order_id}-{int(amount)}"
            
            # Return successful result
            return PaymentResult(success=True, payment_id=payment_id)
            
        except Exception as e:
            return PaymentResult(success=False, error_message=str(e))
    
    def refund_payment(self, payment_id):
        """Refund a payment"""
        try:
            # In a real implementation, this would integrate with a payment gateway
            # For demonstration purposes, we'll simulate a successful refund
            
            # Return successful result
            return True
            
        except Exception as e:
            return False