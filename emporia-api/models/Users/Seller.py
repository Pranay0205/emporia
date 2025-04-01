from models.Users.User import User  


class Seller(User):

    def __init__(self,  id: int, first_name: str, last_name: str, user_name: str, email: str, password: str, role: str, seller_id: int, store_name: str, store_desc: str):
        super().__init__(id, first_name, last_name, user_name, email, password, role)
        self.seller_id = seller_id
        self.store_name = store_name
        self.store_desc = store_desc

    def __str__(self):
        return f"Seller(seller_id={self.seller_id}, store_name='{self.store_name}', store_desc='{self.store_desc}', {super().__str__()})"
