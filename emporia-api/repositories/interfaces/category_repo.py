from abc import abstractmethod


class CategoryRepository:
    def __init__(self, db):
        self.db = db

    @abstractmethod
    def get_all_categories(self):
        """
        Fetch all categories from the database.
        """
        pass

    @abstractmethod
    def get_by_id(self, category_id):
        pass

    @abstractmethod
    def create(self, category):
        """
        Create a new category in the database.
        """
        pass

    @abstractmethod
    def update(self, category):
        """
        Update an existing category in the database.
        """
        pass

    @abstractmethod
    def delete(self, category_id):
        """
        Delete a category from the database.
        """
        pass
