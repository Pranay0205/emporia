from models.Users.User import User  


class Customer(User):

    def __init__(self, id: int, first_name: str, last_name: str, user_name: str, email: str, password: str, role: str, customer_id: int, address: str):
        super().__init__(id, first_name, last_name, user_name, email, password, role)
        self.customer_id = customer_id
        self.address = address

    def __str__(self):
        return f"Customer(id={self.customer_id}, address='{self.address}', {super().__str__()})"
