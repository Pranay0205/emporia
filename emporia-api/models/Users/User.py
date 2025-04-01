class User:
    def __init__(self, id: int, first_name: str, last_name: str, user_name: str, email: str, password: str, is_customer: bool, is_admin: bool, is_seller: bool):
        self.id = id
        self.first_name = first_name
        self.last_name = last_name
        self.user_name = user_name
        self.email = email
        self.password = password
        self.is_user = is_customer
        self.is_admin = is_admin
        self.is_seller = is_seller

    def __str__(self):
        return (f"User(id={self.id}, firstname={self.first_name}, lastname={self.last_name}, "
                f"username={self.user_name}, email={self.email}, password={self.password}, "
                f"is_customer={self.is_user}, is_admin={self.is_admin}, is_seller={self.is_seller})")
