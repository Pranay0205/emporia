from abc import abstractmethod

class ProductRepository:
    def __init__(self, db):
        self.db = db
      
    @abstractmethod
    def get_all_products(self, limit=100, offset=0):
        """
        Fetch all products from the database.
        """
        pass
      
    @abstractmethod
    def get_by_id(self, product_id):
        """
        Fetch a product by its ID from the database.
        """
        pass

    @abstractmethod
    def get_by_category(self, category_id):
        """
        Fetch products by category ID.
        """
        pass

    @abstractmethod
    def get_by_seller(self, seller_id):
        """
        Fetch products by seller ID.
        """
        pass
  
    @abstractmethod
    def create(self, product):
        """
        Create a new product in the database.
        """
        pass

    @abstractmethod
    def update(self, product):
        """
        Update an existing product in the database.
        """
        pass

    @abstractmethod
    def delete(self, product_id):
        """
        Delete a product from the database.
        """
        pass