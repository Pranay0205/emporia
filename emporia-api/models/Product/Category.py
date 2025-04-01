

class Category():
    def __init__(self, category_id: int, name: str, description: str):
        self.category_id = category_id
        self.name = name
        self.description = description

    def __str__(self):
        return f"Category(id={self.category_id}, name='{self.name}', description='{self.description}')"
