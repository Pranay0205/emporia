# emporia-api/repositories/database/db_order_repo.py
from repositories.interfaces.order_repo import OrderRepository
import mysql.connector
from models.Order.Order import Order
from datetime import datetime

class DBOrderRepo(OrderRepository):
    def __init__(self, db):
        super().__init__(db)
        self.connection = db.connection
        self.cursor = db.cursor
        
    def create_order(self, order):
        try:
            # Insert the order
            self.cursor.execute("""
                INSERT INTO orders (customer_id, order_date, status, total_amount)
                VALUES (%s, %s, %s, %s)
            """, (
                order.customer_id,
                order.date,
                order.status,
                order.amount
            ))
            
            order_id = self.cursor.lastrowid
            order.order_id = order_id
            
            # Insert order items
            for item in order.product_list:
                self.cursor.execute("""
                    INSERT INTO order_items (order_id, product_id, quantity, price)
                    VALUES (%s, %s, %s, %s)
                """, (
                    order_id,
                    item.product.product_id,
                    item.quantity,
                    item.product.price
                ))
            
            self.connection.commit()
            return order
            
        except mysql.connector.Error as err:
            self.connection.rollback()
            print(f"MySQL Error: {err.errno} - {err.msg}")
            raise ValueError(f"Database error: {err}")
                
        except Exception as e:
            self.connection.rollback()
            print(f"Unexpected error: {e}")
            raise Exception(f"Order creation failed: {e}")
    
    def get_by_id(self, order_id):
        try:
            # Get order
            self.cursor.execute("""
                SELECT id, customer_id, order_date, status, total_amount
                FROM orders 
                WHERE id = %s
            """, (order_id,))
            
            order_data = self.cursor.fetchone()
            
            if not order_data:
                return None
                
            # Get order items
            self.cursor.execute("""
                SELECT oi.product_id, oi.quantity, oi.price, p.name, p.description
                FROM order_items oi
                JOIN products p ON oi.product_id = p.id
                WHERE oi.order_id = %s
            """, (order_id,))
            
            items_data = self.cursor.fetchall()
            
            # Create product objects for each item
            product_list = []
            for item in items_data:
                from models.Product.Product import Product
                product = Product(
                    product_id=item[0],
                    name=item[3],
                    description=item[4],
                    price=item[2],
                    # Other fields would be populated here
                    seller_id=None,
                    category_id=None,
                    image=None,
                    stock=None
                )
                
                # Create CartItem or similar object to hold product and quantity
                class CartItem:
                    def __init__(self, product, quantity):
                        self.product = product
                        self.quantity = quantity
                
                product_list.append(CartItem(product, item[1]))
            
            # Create and return order object
            order = Order(
                order_id=order_data[0],
                customer_id=order_data[1],
                date=order_data[2],
                status=order_data[3],
                amount=order_data[4],
                product_list=product_list
            )
            
            return order
                
        except Exception as e:
            raise ValueError(f"Error fetching order: {e}")
    
    def get_orders_by_customer(self, customer_id):
        try:
            # Get all orders for customer
            self.cursor.execute("""
                SELECT id FROM orders 
                WHERE customer_id = %s
                ORDER BY order_date DESC
            """, (customer_id,))
            
            order_ids = self.cursor.fetchall()
            
            # Get full order details for each order ID
            orders = []
            for order_id in order_ids:
                order = self.get_by_id(order_id[0])
                if order:
                    orders.append(order)
                    
            return orders
                
        except Exception as e:
            raise ValueError(f"Error fetching orders: {e}")
    
    def update_order(self, order):
        try:
            self.cursor.execute("""
                UPDATE orders 
                SET status = %s, total_amount = %s
                WHERE id = %s
            """, (
                order.status,
                order.amount,
                order.order_id
            ))
            
            if self.cursor.rowcount == 0:
                raise ValueError(f"Order with ID {order.order_id} not found")
                
            self.connection.commit()
            return order
            
        except mysql.connector.Error as err:
            self.connection.rollback()
            print(f"MySQL Error: {err.errno} - {err.msg}")
            raise ValueError(f"Database error: {err}")
                
        except Exception as e:
            self.connection.rollback()
            raise Exception(f"Order update failed: {e}")
    
    def delete_order(self, order_id):
        try:
            # Delete order items first (foreign key constraint)
            self.cursor.execute("""
                DELETE FROM order_items 
                WHERE order_id = %s
            """, (order_id,))
            
            # Delete the order
            self.cursor.execute("""
                DELETE FROM orders 
                WHERE id = %s
            """, (order_id,))
            
            if self.cursor.rowcount == 0:
                raise ValueError(f"Order with ID {order_id} not found")
                
            self.connection.commit()
            return True
            
        except mysql.connector.Error as err:
            self.connection.rollback()
            print(f"MySQL Error: {err.errno} - {err.msg}")
            raise ValueError(f"Database error: {err}")
                
        except Exception as e:
            self.connection.rollback()
            raise Exception(f"Order deletion failed: {e}")
        

        
    