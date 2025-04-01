from models.Users.User import User
from typing import Dict, Callable, Optional


class UserFactory:
    _creators: Dict[str, Callable[..., User]] = {}

    # Register the user types and their corresponding creators
    @classmethod
    def register_user_type(cls, user_type: str, creator: Callable[..., User]) -> None:
        cls._creators[user_type] = creator

    def create_user(self, user_type: str, **kwargs) -> Optional[User]:
        if user_type not in self._creators:
            raise ValueError(f"Unknown user type: {user_type}")
        return self._creators[user_type](**kwargs)
