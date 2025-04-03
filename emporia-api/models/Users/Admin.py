
from models.Users.User import User 

class Admin(User):
    def __init__(self,  id: int, first_name: str, last_name: str, user_name: str, email: str, password: str, role: str, admin_id: int, permissions: list[str]):
        super().__init__(id, first_name, last_name, user_name, email, password, role)
        self.admin_id = admin_id
        self.permissions = permissions
        
    def __str__(self):
        return f"Admin(id={self.id}, first_name={self.first_name}, last_name={self.last_name}, user_name={self.user_name}, email={self.email}, role={self.role}, admin_id={self.admin_id}, permissions={self.permissions})"
