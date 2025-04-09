from models.Users.User import User  


class Seller(User):

    def __init__(self,  id: int, first_name: str, last_name: str, user_name: str, email: str, password: str, role: str, seller_id: int, store_name: str, store_desc: str):
        super().__init__(id, first_name, last_name, user_name, email, password, role)
        self.seller_id = seller_id
        self.store_name = store_name
        self.store_desc = store_desc
        
    
    def __str__(self):
        return f"Seller(seller_id={self.seller_id}, store_name='{self.store_name}', store_desc='{self.store_desc}', id={self.id}, first_name='{self.first_name}', last_name='{self.last_name}', user_name='{self.user_name}', email='{self.email}', role='{self.role}')"

    
    def update_store_info(self, store_name: str, store_desc: str):
        self.store_name = store_name
        self.store_desc = store_desc
