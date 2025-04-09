from models.Users.User import User  


class Customer(User):

    def __init__(self, id: int, first_name: str, last_name: str, user_name: str, email: str, password: str, role: str, customer_id: int, address: str,phone_number: str):
        super().__init__(id, first_name, last_name, user_name, email, password, role)
        self.customer_id = customer_id
        self.address = address
        self.phone_number = phone_number

    def __str__(self):
        return f"Customer(id={self.id}, first_name='{self.first_name}', last_name='{self.last_name}', user_name='{self.user_name}', email='{self.email}', role='{self.role}', customer_id={self.customer_id}, address='{self.address}', phone_number='{self.phone_number}')"

    def update_address(self, address: str):
        self.address = address
    
    def update_phone_number(self, phone_number: str):
        self.phone_number = phone_number
        
    def update_email(self, email: str):
        self.email = email
        