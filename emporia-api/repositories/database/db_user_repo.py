from repositories.interfaces.user_repo import UserRepository
import mysql.connector

class DBUserRepo(UserRepository):
    def __init__(self, db):
        super().__init__(db)
        self.connection = db.connection
        self.cursor = db.cursor
        
    def create(self, user):    
        try:
            self.cursor.execute("""
                INSERT INTO users (username, first_name, last_name, email, password, role)
                VALUES (%s, %s, %s, %s, %s, %s)
            """, (user.user_name, user.first_name, user.last_name, 
                  user.email, user.password, user.role))
            
            user_id = self.cursor.lastrowid
            
            # Handle role-specific data
            if user.role == 'customer':
                self.cursor.execute("""
                    INSERT INTO customers (user_id, address, phone_number)
                    VALUES (%s, %s, %s)
                """, (user_id, user.address, user.phone_number))  # Use user_id, not user.id
                user.customer_id = self.cursor.lastrowid
            
            elif user.role == 'seller':
                self.cursor.execute("""
                    INSERT INTO sellers (user_id, store_name, store_desc)
                    VALUES (%s, %s, %s)
                """, (user_id, user.store_name, user.store_desc))  # Use user_id, not user.id
                
                user.seller_id = self.cursor.lastrowid
                
            elif user.role == 'admin':
                # Convert permissions list to string if it's a list
                permissions_str = ','.join(user.permissions) if isinstance(user.permissions, list) else user.permissions
                
                self.cursor.execute("""
                    INSERT INTO admins (user_id, permissions)
                    VALUES (%s, %s)
                """, (user_id, permissions_str))  # Use user_id, not user.id
                
                user.admin_id = self.cursor.lastrowid
                    
            self.connection.commit()
            
            print(f"{user.first_name} has joined the {user.role} community!")
            
            return user
        
        except mysql.connector.Error as err:
            # Rollback the transaction
            self.connection.rollback()
            
            # Handle specific MySQL errors
            if err.errno == 1062:  # Duplicate entry error
                if "username" in str(err):
                    raise ValueError(f"Username '{user.user_name}' is already taken")
                elif "email" in str(err):
                    raise ValueError(f"Email '{user.email}' is already registered")
                else:
                    raise ValueError(f"Duplicate entry: {err}")
            elif err.errno == 1452:  # Foreign key constraint fails
                raise ValueError(f"Invalid reference: {err}")
            elif err.errno == 1054:  # Unknown column error
                raise ValueError(f"Database schema error: {err}")
            elif err.errno == 1146:  # Table doesn't exist
                raise ValueError(f"Table doesn't exist: {err}")
            else:
                # Log the error for debugging
                print(f"MySQL Error: {err.errno} - {err.msg}")
                raise ValueError(f"Database error: {err}")
                
        except Exception as e:
            # Handle other exceptions
            self.connection.rollback()
            print(f"Unexpected error: {e}")
            raise Exception(f"User creation failed: {e}")