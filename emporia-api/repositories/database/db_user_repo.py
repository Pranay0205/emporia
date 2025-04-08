from interfaces.user_repo import UserRepository

class DBUserRepo(UserRepository):
    def __init__(self, db):
        super().__init__(db)
        
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
            """, (user.id, user.address, user.phone_number))
            user.customer_id = self.cursor.lastrowid
        
        if user.role == 'seller':
            self.cursor.execute("""
                INSERT INTO seller (user_id, store_name, store_desc)
                VALUES (%s, %s, %s)
            """, (user.id, user.store_name, user.store_desc))
            
            user.seller_id = self.cursor.lastrowid
            
        if user.role == 'admin':
            self.cursor.execute("""
                INSERT INTO admin (user_id, permissions)
                VALUES (%s, %s)
            """, (user.id, user.permissions))
            
            user.admin_id = self.cursor.lastrowid
                
            
        self.connection.commit()
            
        return user
    
      except:
          raise Exception(f"User creation failed {user}")
          

        
        
        
        
        
              