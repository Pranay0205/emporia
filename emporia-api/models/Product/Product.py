class Product:
    def __init__(self, product_id: int, seller_id: int, category_id: str, name: str, description: str, image: str, price: int, stock: int):
        self.product_id = product_id
        self.seller_id = seller_id
        self.category_id = category_id
        self.name = name
        self.description = description
        self.image = image
        self.price = price
        self.stock = stock

    def __str__(self):
        return (f"Product(product_id={self.product_id}, seller_id={self.seller_id}, "
                f"category_id={self.category_id}, name={self.name}, description={self.description}, "
                f"image={self.image}, price={self.price}, stock={self.stock})")
