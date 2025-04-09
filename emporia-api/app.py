import re
from flask import request
from flask import Flask
from reg import User_Registry
from repositories.database.db_connection import DatabaseConnection
from repositories.database.db_user_repo import DBUserRepo
from services.user_services import UserService
from routes.auth.authenticate import auth_bp

app = Flask(__name__)

if __name__ == '__main__':
    print("Starting the Flask app...")
    db = None
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
        
    except KeyboardInterrupt:
        print("Keyboard interrupt detected. Shutting down gracefully...")
        # Handle Ctrl+C specifically
    
    except Exception as e:
        print(f"Error: {e}")
        # Handle other exceptions
        
    finally:
        # This will run regardless of how the try block exits
        if db is not None and hasattr(db, 'connection'):
            print("Closing database connection...")
            db.connection.close()