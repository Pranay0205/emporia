import configparser
import mysql.connector

class DatabaseConnection:
  _db_instance = None
  
  def __new__(cls, *args, **kwargs):
    if not cls._db_instance:
      cls._db_instance = super(DatabaseConnection, cls).__new__(cls)
      cls._db_instance.connection = None
      cls._db_instance.cursor = None
      cls._db_instance._connect()
    return cls._db_instance
  
  def _connect(self):
    try:
      config = configparser.ConfigParser()
      config.read('configs/config.ini')

      self.connection = mysql.connector.connect(
        host=config['database']['host'],
        user=config['database']['user'],
        password=config['database']['password'],
        database=config['database']['database']
      )
      # Using a buffered cursor to prevent "Commands out of sync" errors
      self.cursor = self.connection.cursor(buffered=True)
      print("Database connection established.")
    except mysql.connector.Error as err:
      print(f"Error: {err}")
      self.connection = None
      self.cursor = None      
    except configparser.Error as err:
      print(f"Error reading configuration file: {err}")
