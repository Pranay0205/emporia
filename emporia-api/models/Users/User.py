class User:
    def __init__(self, id: int, first_name: str, last_name: str, user_name: str, email: str, password: str, role: str):
        self.id = id
        self.user_name = user_name
        self.first_name = first_name
        self.last_name = last_name
        self.email = email
        self.password = password
        self.role = role

    def __str__(self):
        return (f"User(id={self.id}, firstname={self.first_name}, lastname={self.last_name}, "
                f"username={self.user_name}, email={self.email}, password={self.password}, "
                f"role={self.role})")

    def update_username(self, user_name: str):
        self.user_name = user_name

    def update_first_name(self, first_name: str):
        self.first_name = first_name

    def update_last_name(self, last_name: str):
        self.last_name = last_name

    def update_email(self, email: str):
        self.email = email

    def update_password(self, password: str):
        self.password = password

    def to_json(self):

        user_dict = {
            "id": self.id,
            "username": self.user_name,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "email": self.email,
            "role": self.role
        }

        return user_dict
