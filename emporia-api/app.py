import re
from flask import config, request
from flask import Flask
from reg import User_Registry
from repositories.database.db_connection import DatabaseConnection
from repositories.database.db_user_repo import DBUserRepo
from services.user_services import UserService
from routes import register_blueprints
import configparser
from flask_cors import CORS

app = Flask(__name__)
config = configparser.ConfigParser()
config.read('configs/config.ini')
app.secret_key = config['server']['secret_key']
CORS(app, supports_credentials=True)


if __name__ == '__main__':
    print("Starting the Flask app...")
  
    # Initialize database connection
    db = DatabaseConnection()

    # Initialize repositories
    user_repo = DBUserRepo(db)

    # Initialize services
    user_service = UserService(user_repo)

    # Add services to app context
    app.user_service = user_service

    # Register all blueprints
    register_blueprints(app)
    
    # Register user types
    User_Registry.register_all_user_types()

    app.run(debug=True)
    