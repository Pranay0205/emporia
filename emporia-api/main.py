import re
from flask import request
from flask import Flask
from registry import User_Registry

app = Flask(__name__)


@app.route('/')
def home():
    return 'Hello, World!'


if __name__ == '__main__':
    print("Starting the Flask app...")
    User_Registry.register_all_user_types()

    app.run(debug=True)
