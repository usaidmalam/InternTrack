from app import app, DB_PATH
from database import create_database
from flask import send_from_directory
from pathlib import Path

# Find the React production build
FRONTEND_PATH = Path(__file__).resolve().parent.parent / "frontend" / "dist"

# Initialize the database
create_database(DB_PATH)

# Replace the home endpoint with the React website
def serve_frontend():
    return send_from_directory(FRONTEND_PATH, "index.html")

app.view_functions["home"] = serve_frontend

# Serve React assets
@app.route("/assets/<path:filename>")
def serve_assets(filename):
    return send_from_directory(
        FRONTEND_PATH / "assets", filename
    )