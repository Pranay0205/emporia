import re
from flask import request
from flask import Flask
from reg import User_Registry
from repositories.database.db_connection import DatabaseConnection
from repositories.database.db_user_repo import DBUserRepo
from services.user_services import UserService
from routes.auth.authenticate import auth_bp

app = Flask(__name__)

@app.route('/')
def home():
    return 'Hello, World!'

if __name__ == '__main__':
    print("Starting the Flask app...")
    try:    
        # Initialize database connection
        db = DatabaseConnection()

        # Initialize repositories
        user_repo = DBUserRepo(db)

        # Initialize services
        user_service = UserService(user_repo)

        # Add services to app context
        app.user_service = user_service

        # Register blueprints
        app.register_blueprint(auth_bp)
        
        User_Registry.register_all_user_types()


        app.run(debug=True)
        
    except Exception as e:
        print({e})
