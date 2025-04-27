# Activate virtual environment if it exists
if (Test-Path ".\venv\Scripts\Activate.ps1") {
  .\venv\Scripts\Activate.ps1
}

# Run the Flask application
python app.py