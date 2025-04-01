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
