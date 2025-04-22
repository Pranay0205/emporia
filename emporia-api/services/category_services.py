from models.Product.Category import Category

class CategoryService:
    def __init__(self, category_repository):
        self.category_repository = category_repository
    
    def create_category(self, category_data):
        """
        Create a new category from the provided data.
        """
        try:
            # Basic validation
            if not category_data.get('name'):
                raise ValueError("Category name is required")
                
            # Create a new Category object
            category = Category(
                category_id=None,  # This will be assigned by the database
                name=category_data.get('name'),
                description=category_data.get('description', '')
            )
            
            # Save to database
            return self.category_repository.create(category)
            
        except Exception as e:
            raise ValueError(f"Failed to create category: {str(e)}")
    
    def get_all_categories(self):
        """
        Get all categories.
        """
        try:
            categories = self.category_repository.get_all_categories()
            
            # Convert to dictionary for API response
            return [self._convert_to_dict(category) for category in categories]
            
        except Exception as e:
            raise ValueError(f"Failed to fetch categories: {str(e)}")
    
    def get_category_by_id(self, category_id):
        """
        Get a specific category by ID.
        """
        try:
            category = self.category_repository.get_by_id(category_id)
            
            if not category:
                raise ValueError(f"Category with ID {category_id} not found")
                
            return self._convert_to_dict(category)
            
        except Exception as e:
            raise ValueError(f"Failed to fetch category: {str(e)}")
    
    def update_category(self, category_id, category_data):
        """
        Update an existing category.
        """
        try:
            # First fetch the existing category
            existing_category = self.category_repository.get_by_id(category_id)
            
            if not existing_category:
                raise ValueError(f"Category with ID {category_id} not found")
            
            # Update the fields
            if 'name' in category_data:
                existing_category.name = category_data['name']
                
            if 'description' in category_data:
                existing_category.description = category_data['description']
            
            # Save the changes
            updated_category = self.category_repository.update(existing_category)
            
            return self._convert_to_dict(updated_category)
            
        except Exception as e:
            raise ValueError(f"Failed to update category: {str(e)}")
    
    def delete_category(self, category_id):
        """
        Delete a category by ID.
        """
        try:
            return self.category_repository.delete(category_id)
            
        except Exception as e:
            raise ValueError(f"Failed to delete category: {str(e)}")
    
    def _convert_to_dict(self, category):
        """
        Convert a Category object to a dictionary.
        """
        return {
            'id': category.category_id,
            'name': category.name,
            'description': category.description
        }