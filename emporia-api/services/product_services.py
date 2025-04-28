from models.Product.Product import Product


class ProductService:
    def __init__(self, product_repository):
        self.product_repository = product_repository

    def create_product(self, product_data, seller_id):
        """
        Create a new product from the provided data.
        """
        try:
            # Basic validation
            required_fields = ['name', 'category_id', 'price', 'stock']
            for field in required_fields:
                if field not in product_data:
                    raise ValueError(f"Missing required field: {field}")

            # Validate price and stock are positive numbers
            if float(product_data['price']) <= 0:
                raise ValueError("Price must be greater than zero")

            if int(product_data['stock']) < 0:
                raise ValueError("Stock cannot be negative")

            # Create a new Product object
            product = Product(
                product_id=None,  # This will be assigned by the database
                seller_id=seller_id,
                category_id=product_data['category_id'],
                name=product_data['name'],
                description=product_data.get('description', ''),
                image=product_data.get('image', ''),
                price=float(product_data['price']),
                stock=int(product_data['stock'])
            )

            # Save to database
            return self.product_repository.create(product)

        except Exception as e:
            raise ValueError(f"Failed to create product: {str(e)}")

    def get_all_products(self, limit=100, offset=0):
        """
        Get all products with pagination.
        """
        try:
            products = self.product_repository.get_all_products(limit, offset)

            # Convert to dictionary for API response
            return [self._convert_to_dict(product) for product in products]

        except Exception as e:
            raise ValueError(f"Failed to fetch products: {str(e)}")

    def get_product_by_id(self, product_id):
        """
        Get a specific product by ID.
        """
        try:
            product = self.product_repository.get_by_id(product_id)

            if not product:
                raise ValueError(f"Product with ID {product_id} not found")

            return self._convert_to_dict(product)

        except Exception as e:
            raise ValueError(f"Failed to fetch product: {str(e)}")

    def get_products_by_category(self, category_id):
        """
        Get products by category ID.
        """
        try:
            products = self.product_repository.get_by_category(category_id)

            return [self._convert_to_dict(product) for product in products]

        except Exception as e:
            raise ValueError(f"Failed to fetch products by category: {str(e)}")

    def get_products_by_seller(self, seller_id):
        """
        Get products by seller ID.
        """
        try:
            products = self.product_repository.get_by_seller(seller_id)

            return [self._convert_to_dict(product) for product in products]

        except Exception as e:
            raise ValueError(f"Failed to fetch products by seller: {str(e)}")

    def update_product(self, product_id, product_data, seller_id):
        """
        Update an existing product. Only the seller who created the product can update it.
        """
        try:
            # First fetch the existing product
            existing_product = self.product_repository.get_by_id(product_id)

            if not existing_product:
                raise ValueError(f"Product with ID {product_id} not found")

            # Check if the product belongs to the seller
            if existing_product.seller_id != seller_id:
                raise ValueError(
                    f"Product with ID {product_id} does not belong to seller {seller_id}")

            # Update the fields
            if 'name' in product_data:
                existing_product.name = product_data['name']

            if 'description' in product_data:
                existing_product.description = product_data['description']

            if 'category_id' in product_data:
                existing_product.category_id = product_data['category_id']

            if 'price' in product_data:
                price = float(product_data['price'])
                if price <= 0:
                    raise ValueError("Price must be greater than zero")
                existing_product.price = price

            if 'stock' in product_data:
                stock = int(product_data['stock'])
                if stock < 0:
                    raise ValueError("Stock cannot be negative")
                existing_product.stock = stock

            if 'image' in product_data:
                existing_product.image = product_data['image']

            # Save the changes
            updated_product = self.product_repository.update(existing_product)

            return self._convert_to_dict(updated_product)

        except Exception as e:
            raise ValueError(f"Failed to update product: {str(e)}")

    def delete_product(self, product_id, seller_id=None):
        """
        Delete a product by ID. If seller_id is provided, only the seller who created the product can delete it.
        If no seller_id is provided, assumes admin action.
        """
        try:
            return self.product_repository.delete(product_id, seller_id)

        except Exception as e:
            raise ValueError(f"Failed to delete product: {str(e)}")

    def _convert_to_dict(self, product):
        """
        Convert a Product object to a dictionary.
        """
        return {
            'id': product.product_id,
            'seller_id': product.seller_id,
            'category_id': product.category_id,
            'name': product.name,
            'description': product.description,
            'price': product.price,
            'stock': product.stock,
            'image': product.image
        }
