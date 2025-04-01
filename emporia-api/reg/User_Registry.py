# In user_registry.py
from models.Users.Admin import Admin
from models.Users.Seller import Seller
from models.Users.Customer import Customer
from factories.UserFactory.UserFactory import UserFactory


def register_all_user_types():
    UserFactory.register_user_type('admin', lambda id, first_name, last_name, user_name, email, password, role, admin_id, permissions: Admin(
        id, first_name, last_name, user_name, email, password, role, admin_id, permissions))
    UserFactory.register_user_type('seller', lambda id, first_name, last_name, user_name, email, password, role, seller_id, store_name, store_desc: Seller(
        id, first_name, last_name, user_name, email, password, role, seller_id, store_name, store_desc))
    UserFactory.register_user_type('customer', lambda id, first_name, last_name, user_name, email, password, role, customer_id, address: Customer(
        id, first_name, last_name, user_name, email, password, role, customer_id, address))
