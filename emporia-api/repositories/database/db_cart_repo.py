# emporia-api/repositories/database/db_cart_repo.py
from repositories.interfaces.cart_repo import CartRepository
from models.Order.ShoppingCart import ShoppingCart
from models.Order.CartItem import CartItem
import mysql.connector

class DBCartRepo(CartRepository):
    def __init__(self, db):
        super().__init__(db)
        self.connection = db.connection
        self.cursor = db.cursor
        
    def get_cart(self, cart_id, customer_id):
        try:
            # First check if cart exists and belongs to customer
            self.cursor.execute("""
                SELECT id, customer_id, created_at
                FROM shopping_carts 
                WHERE id = %s AND customer_id = %s
            """, (cart_id, customer_id))
            
            cart_data = self.cursor.fetchone()
            
            if not cart_data:
                return None
                
            # Get cart items
            self.cursor.execute("""
                SELECT ci.product_id, ci.quantity, p.name, p.description, p.price, 
                       p.category_id, p.seller_id, p.image, p.stock
                FROM cart_items ci
                JOIN products p ON ci.product_id = p.id
                WHERE ci.cart_id = %s
            """, (cart_id,))
            
            items_data = self.cursor.fetchall()
            
            # Create shopping cart object
            from models.Product.Product import Product
            
            cart = ShoppingCart(customer_id=customer_id, cart_id=cart_id)
            
            # Add items to cart
            total_price = 0
            for item in items_data:
                product = Product(
                    product_id=item[0],
                    name=item[2],
                    description=item[3],
                    price=item[4],
                    category_id=item[5],
                    seller_id=item[6],
                    image=item[7],
                    stock=item[8]
                )
                
                quantity = item[1]
                cart_item = CartItem(product, quantity)
                cart.items.append(cart_item)
                
                # Update total price
                total_price += product.price * quantity
                
            cart.total_price = total_price
            cart.total_items = len(cart.items)
            
            return cart
                
        except Exception as e:
            raise ValueError(f"Error fetching cart: {e}")
        
    def create_cart(self, customer_id):
        try:
            # Check if customer already has a cart
            self.cursor.execute("""
                SELECT id FROM shopping_carts 
                WHERE customer_id = %s
            """, (customer_id,))
            
            existing_cart = self.cursor.fetchone()
            
            if existing_cart:
                # Return existing cart
                return self.get_cart(existing_cart[0], customer_id)
                
            # Create new cart
            self.cursor.execute("""
                INSERT INTO shopping_carts (customer_id)
                VALUES (%s)
            """, (customer_id,))
            
            cart_id = self.cursor.lastrowid
            self.connection.commit()
            
            # Return new empty cart
            return ShoppingCart(customer_id=customer_id, cart_id=cart_id)
            
        except mysql.connector.Error as err:
            self.connection.rollback()
            print(f"MySQL Error: {err.errno} - {err.msg}")
            raise ValueError(f"Database error: {err}")
                
        except Exception as e:
            self.connection.rollback()
            print(f"Unexpected error: {e}")
            raise Exception(f"Cart creation failed: {e}")
        
    def add_item(self, cart_id, product_id, quantity):
        try:
            # Check if item already exists in cart
            self.cursor.execute("""
                SELECT quantity FROM cart_items 
                WHERE cart_id = %s AND product_id = %s
            """, (cart_id, product_id))
            
            existing_item = self.cursor.fetchone()
            
            if existing_item:
                # Update existing item quantity
                new_quantity = existing_item[0] + quantity
                return self.update_item(cart_id, product_id, new_quantity)
                
            # Check if product exists and has enough stock
            self.cursor.execute("""
                SELECT stock FROM products 
                WHERE id = %s
            """, (product_id,))
            
            product_data = self.cursor.fetchone()
            
            if not product_data:
                raise ValueError(f"Product with ID {product_id} not found")
                
            if product_data[0] < quantity:
                raise ValueError(f"Insufficient stock for product ID {product_id}")
                
            # Add new item to cart
            self.cursor.execute("""
                INSERT INTO cart_items (cart_id, product_id, quantity)
                VALUES (%s, %s, %s)
            """, (cart_id, product_id, quantity))
            
            self.connection.commit()
            
            # Return updated cart
            customer_id = self._get_customer_id_for_cart(cart_id)
            return self.get_cart(cart_id, customer_id)
            
        except mysql.connector.Error as err:
            self.connection.rollback()
            print(f"MySQL Error: {err.errno} - {err.msg}")
            raise ValueError(f"Database error: {err}")
                
        except Exception as e:
            self.connection.rollback()
            print(f"Unexpected error: {e}")
            raise Exception(f"Failed to add item to cart: {e}")
        
    def update_item(self, cart_id, product_id, quantity):
        try:
            # Check if item exists in cart
            self.cursor.execute("""
                SELECT id FROM cart_items 
                WHERE cart_id = %s AND product_id = %s
            """, (cart_id, product_id))
            
            existing_item = self.cursor.fetchone()
            
            if not existing_item:
                raise ValueError(f"Item with product ID {product_id} not found in cart")
                
            # Check if product has enough stock
            self.cursor.execute("""
                SELECT stock FROM products 
                WHERE id = %s
            """, (product_id,))
            
            product_data = self.cursor.fetchone()
            
            if product_data[0] < quantity:
                raise ValueError(f"Insufficient stock for product ID {product_id}")
                
            # Update item quantity
            self.cursor.execute("""
                UPDATE cart_items 
                SET quantity = %s
                WHERE cart_id = %s AND product_id = %s
            """, (quantity, cart_id, product_id))
            
            self.connection.commit()
            
            # Return updated cart
            customer_id = self._get_customer_id_for_cart(cart_id)
            return self.get_cart(cart_id, customer_id)
            
        except mysql.connector.Error as err:
            self.connection.rollback()
            print(f"MySQL Error: {err.errno} - {err.msg}")
            raise ValueError(f"Database error: {err}")
                
        except Exception as e:
            self.connection.rollback()
            print(f"Unexpected error: {e}")
            raise Exception(f"Failed to update cart item: {e}")
        
    def remove_item(self, cart_id, product_id):
        try:
            # Check if item exists in cart
            self.cursor.execute("""
                SELECT id FROM cart_items 
                WHERE cart_id = %s AND product_id = %s
            """, (cart_id, product_id))
            
            existing_item = self.cursor.fetchone()
            
            if not existing_item:
                raise ValueError(f"Item with product ID {product_id} not found in cart")
                
            # Remove item from cart
            self.cursor.execute("""
                DELETE FROM cart_items 
                WHERE cart_id = %s AND product_id = %s
            """, (cart_id, product_id))
            
            self.connection.commit()
            
            # Return updated cart
            customer_id = self._get_customer_id_for_cart(cart_id)
            return self.get_cart(cart_id, customer_id)
            
        except mysql.connector.Error as err:
            self.connection.rollback()
            print(f"MySQL Error: {err.errno} - {err.msg}")
            raise ValueError(f"Database error: {err}")
                
        except Exception as e:
            self.connection.rollback()
            print(f"Unexpected error: {e}")
            raise Exception(f"Failed to remove item from cart: {e}")
        
    def clear_cart(self, cart_id):
        try:
            # Remove all items from cart
            self.cursor.execute("""
                DELETE FROM cart_items 
                WHERE cart_id = %s
            """, (cart_id,))
            
            self.connection.commit()
            
            # Return empty cart
            customer_id = self._get_customer_id_for_cart(cart_id)
            return ShoppingCart(customer_id=customer_id, cart_id=cart_id)
            
        except mysql.connector.Error as err:
            self.connection.rollback()
            print(f"MySQL Error: {err.errno} - {err.msg}")
            raise ValueError(f"Database error: {err}")
                
        except Exception as e:
            self.connection.rollback()
            print(f"Unexpected error: {e}")
            raise Exception(f"Failed to clear cart: {e}")
            
    def _get_customer_id_for_cart(self, cart_id):
        """Helper method to get customer ID for a cart"""
        self.cursor.execute("""
            SELECT customer_id FROM shopping_carts 
            WHERE id = %s
        """, (cart_id,))
        
        result = self.cursor.fetchone()
        if not result:
            raise ValueError(f"Cart with ID {cart_id} not found")
            
        return result[0]