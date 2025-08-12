from flask import g
from repositories.interfaces.product_repo import ProductRepository
import mysql.connector
from models.Product.Product import Product

class DBProductRepo(ProductRepository):
    def __init__(self, db):
        super().__init__(db)
        self.connection = db.connection
        self.cursor = db.cursor
        
    def create(self, product):
        try:
            self.cursor.execute("""
                INSERT INTO products (category_id, name, description, price, stock, seller_id, image)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """, (
                product.category_id, 
                product.name, 
                product.description, 
                product.price, 
                product.stock,
                product.seller_id,
                product.image
            ))
            
            product_id = self.cursor.lastrowid
            product.product_id = product_id
            
            self.connection.commit()
            return product
            
        except mysql.connector.Error as err:
            self.connection.rollback()
            print(f"MySQL Error: {err.errno} - {err.msg}")
            
            if err.errno == 1452:  # Foreign key constraint fails
                if "seller_id" in str(err):
                    raise ValueError(f"Invalid seller ID: {product.seller_id}")
                elif "category_id" in str(err):
                    raise ValueError(f"Invalid category ID: {product.category_id}")
                else:
                    raise ValueError(f"Foreign key constraint error: {err}")
            else:
                raise ValueError(f"Database error: {err}")
                
        except Exception as e:
            self.connection.rollback()
            print(f"Unexpected error: {e}")
            raise Exception(f"Product creation failed: {e}")
    
    def get_all_products(self, limit=100, offset=0):
        try:
            self.cursor.execute("""
                SELECT id, category_id, name, description, price, stock, seller_id, image
                FROM products
                LIMIT %s OFFSET %s
            """, (limit, offset))
            
            products_data = self.cursor.fetchall()
            products = []
            
            for product_data in products_data:
                product = Product(
                    product_id=product_data[0],
                    category_id=product_data[1],
                    name=product_data[2],
                    description=product_data[3],
                    price=product_data[4],
                    stock=product_data[5],
                    seller_id=product_data[6],
                    image=product_data[7]
                )
                products.append(product)
                
            return products
            
        except Exception as e:
            raise ValueError(f"Error fetching products: {e}")
    
    def get_by_id(self, product_id):
        try:
            self.cursor.execute("""
                SELECT id, category_id, name, description, price, stock, seller_id, image
                FROM products 
                WHERE id = %s
            """, (product_id,))
            
            product_data = self.cursor.fetchone()
            
            if product_data:
                return Product(
                    product_id=product_data[0],
                    category_id=product_data[1],
                    name=product_data[2],
                    description=product_data[3],
                    price=product_data[4],
                    stock=product_data[5],
                    seller_id=product_data[6],
                    image=product_data[7]
                )
            else:
                return None
                
        except Exception as e:
            raise ValueError(f"Error fetching product by ID: {e}")
    
    def get_by_category(self, category_id):
        try:
            self.cursor.execute("""
                SELECT id, category_id, name, description, price, stock, seller_id, image
                FROM products 
                WHERE category_id = %s
            """, (category_id,))
            
            products_data = self.cursor.fetchall()
            products = []
            
            for product_data in products_data:
                product = Product(
                    product_id=product_data[0],
                    category_id=product_data[1],
                    name=product_data[2],
                    description=product_data[3],
                    price=product_data[4],
                    stock=product_data[5],
                    seller_id=product_data[6],
                    image=product_data[7]
                )
                products.append(product)
                
            return products
                
        except Exception as e:
            raise ValueError(f"Error fetching products by category: {e}")
    
    def get_by_seller(self, seller_id):
        try:
            print(f"Retrieving products for seller ID: {seller_id}")
            self.cursor.execute("""
                SELECT id, category_id, name, description, price, stock, seller_id, image
                FROM products 
                WHERE seller_id = %s
            """, (seller_id,))
            
            products_data = self.cursor.fetchall()
            print(f"Retrieved {len(products_data)} products for seller ID {seller_id}")
            products = []
            
            for product_data in products_data:
                product = Product(
                    product_id=product_data[0],
                    category_id=product_data[1],
                    name=product_data[2],
                    description=product_data[3],
                    price=product_data[4],
                    stock=product_data[5],
                    seller_id=product_data[6],
                    image=product_data[7]
                )
                products.append(product)
           
            return products
                
        except Exception as e:
            raise ValueError(f"Error fetching products by seller: {e}")
    
    def update(self, product):
        try:
            self.cursor.execute("""
                UPDATE products 
                SET category_id = %s, name = %s, description = %s, price = %s, stock = %s, image = %s
                WHERE id = %s AND seller_id = %s
            """, (
                product.category_id,
                product.name,
                product.description,
                product.price,
                product.stock,
                product.image,
                product.product_id,
                product.seller_id
            ))
            
            if self.cursor.rowcount == 0:
                # Check if product exists but belongs to another seller
                self.cursor.execute("""
                    SELECT COUNT(*) FROM products 
                    WHERE id = %s AND seller_id != %s
                """, (product.product_id, product.seller_id))
                
                count = self.cursor.fetchone()[0]
                
                if count > 0:
                    raise ValueError(f"Product with ID {product.product_id} exists but does not belong to seller {product.seller_id}")
                else:
                    raise ValueError(f"Product with ID {product.product_id} not found")
                
            self.connection.commit()
            return product
            
        except mysql.connector.Error as err:
            self.connection.rollback()
            
            if err.errno == 1452:  # Foreign key constraint fails
                if "category_id" in str(err):
                    raise ValueError(f"Invalid category ID: {product.category_id}")
                else:
                    raise ValueError(f"Foreign key constraint error: {err}")
            else:
                print(f"MySQL Error: {err.errno} - {err.msg}")
                raise ValueError(f"Database error: {err}")
                
        except Exception as e:
            self.connection.rollback()
            raise Exception(f"Product update failed: {e}")
    
    def delete(self, product_id, seller_id=None):
        try:
            # If seller_id is provided, ensure product belongs to the seller
            if seller_id is not None:
                self.cursor.execute("""
                    DELETE FROM products 
                    WHERE id = %s AND seller_id = %s
                """, (product_id, seller_id))
                
                if self.cursor.rowcount == 0:
                    # Check if product exists but belongs to another seller
                    self.cursor.execute("""
                        SELECT COUNT(*) FROM products 
                        WHERE id = %s AND seller_id != %s
                    """, (product_id, seller_id))
                    
                    count = self.cursor.fetchone()[0]
                    
                    if count > 0:
                        raise ValueError(f"Product with ID {product_id} exists but does not belong to seller {seller_id}")
                    else:
                        raise ValueError(f"Product with ID {product_id} not found")
            else:
                # Admin delete - no seller_id check
                self.cursor.execute("""
                    DELETE FROM products WHERE id = %s
                """, (product_id,))
                
                if self.cursor.rowcount == 0:
                    raise ValueError(f"Product with ID {product_id} not found")
                
            self.connection.commit()
            return True
            
        except mysql.connector.Error as err:
            self.connection.rollback()
            print(f"MySQL Error: {err.errno} - {err.msg}")
            raise ValueError(f"Database error: {err}")
            
        except Exception as e:
            self.connection.rollback()
            raise Exception(f"Product deletion failed: {e}")