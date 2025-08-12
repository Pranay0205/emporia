from flask import g
from repositories.interfaces.category_repo import CategoryRepository
import mysql.connector
from models.Product.Category import Category

class DBCategoryRepo(CategoryRepository):
    def __init__(self, db):
        super().__init__(db)
        self.connection = db.connection
        self.cursor = db.cursor
        
    def create(self, category):
        try:
            self.cursor.execute("""
                INSERT INTO categories (name, description)
                VALUES (%s, %s)
            """, (category.name, category.description))
            
            category_id = self.cursor.lastrowid
            category.category_id = category_id
            
            self.connection.commit()
            return category
            
        except mysql.connector.Error as err:
            self.connection.rollback()
            if err.errno == 1062:  # Duplicate entry error
                raise ValueError(f"Category '{category.name}' already exists")
            else:
                # Log the error for debugging
                print(f"MySQL Error: {err.errno} - {err.msg}")
                raise ValueError(f"Database error: {err}")
        except Exception as e:
            self.connection.rollback()
            print(f"Unexpected error: {e}")
            raise Exception(f"Category creation failed: {e}")
    
    def get_all_categories(self):
        try:
            self.cursor.execute("""
                SELECT id, name, description 
                FROM categories
                ORDER BY name ASC
            """)
            
            categories_data = self.cursor.fetchall()
            categories = []
            
            for category_data in categories_data:
                category = Category(
                    category_id=category_data[0],
                    name=category_data[1],
                    description=category_data[2]
                )
                categories.append(category)
                
            return categories
            
        except Exception as e:
            raise ValueError(f"Error fetching categories: {e}")
    
    def get_by_id(self, category_id):
        try:
            self.cursor.execute("""
                SELECT id, name, description 
                FROM categories 
                WHERE id = %s
            """, (category_id,))
            
            category_data = self.cursor.fetchone()
            
            if category_data:
                return Category(
                    category_id=category_data[0],
                    name=category_data[1],
                    description=category_data[2]
                )
            else:
                return None
                
        except Exception as e:
            raise ValueError(f"Error fetching category by ID: {e}")
    
    def update(self, category):
        try:
            self.cursor.execute("""
                UPDATE categories 
                SET name = %s, description = %s
                WHERE id = %s
            """, (category.name, category.description, category.category_id))
            
            if self.cursor.rowcount == 0:
                raise ValueError(f"Category with ID {category.category_id} not found")
                
            self.connection.commit()
            return category
            
        except mysql.connector.Error as err:
            self.connection.rollback()
            # Handle specific MySQL errors
            if err.errno == 1062:  # Duplicate entry error
                raise ValueError(f"Category name '{category.name}' already exists")
            else:
                print(f"MySQL Error: {err.errno} - {err.msg}")
                raise ValueError(f"Database error: {err}")
        except Exception as e:
            self.connection.rollback()
            raise Exception(f"Category update failed: {e}")
    
    def delete(self, category_id):
        try:
            # First check if there are any products using this category
            self.cursor.execute("""
                SELECT COUNT(*) FROM products WHERE category_id = %s
            """, (category_id,))
            
            count = self.cursor.fetchone()[0]
            
            if count > 0:
                raise ValueError(f"Cannot delete category with ID {category_id} as it is used by {count} products")
            
            # Delete the category if no products are using it
            self.cursor.execute("""
                DELETE FROM categories WHERE id = %s
            """, (category_id,))
            
            if self.cursor.rowcount == 0:
                raise ValueError(f"Category with ID {category_id} not found")
                
            self.connection.commit()
            return True
            
        except mysql.connector.Error as err:
            self.connection.rollback()
            print(f"MySQL Error: {err.errno} - {err.msg}")
            raise ValueError(f"Database error: {err}")
        except Exception as e:
            self.connection.rollback()
            raise Exception(f"Category deletion failed: {e}")