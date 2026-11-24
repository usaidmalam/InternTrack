from flask import Flask, request, jsonify
from flask_cors import CORS
from pathlib import Path
import sqlite3

app = Flask(__name__)
CORS(app)

# Find the database in the backend folder
DB_PATH = Path(__file__).parent / "applications.db"

# Connect to the database
def get_db():
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    return connection


# Home page
@app.route("/")
def home():
    return {"message": "InternTrack API is running"}


# Get all job applications
@app.route("/applications", methods=["GET"])
def get_applications():
    connection = get_db()
    cursor = connection.cursor()

    cursor.execute("SELECT * FROM applications")
    applications = cursor.fetchall()

    connection.close()

    return jsonify([dict(row) for row in applications])


# Add a new job application
@app.route("/applications", methods=["POST"])
def add_application():
    data = request.get_json(silent=True)

    # Check required information
    if not isinstance(data, dict):
        return {"error": "Invalid application data"}, 400

    if not all(data.get(field) for field in
               ["company", "position", "status"]):
        return {"error": "Missing required fields"}, 400

    connection = get_db()
    cursor = connection.cursor()

    cursor.execute("""
        INSERT INTO applications
        (company, position, status, date_applied, notes)
        VALUES (?, ?, ?, ?, ?)
    """, (
        data["company"],
        data["position"],
        data["status"],
        data.get("date_applied", ""),
        data.get("notes", "")
    ))

    connection.commit()
    connection.close()

    return {"message": "Application added successfully"}, 201

# Update a job application
@app.route("/applications/<int:id>", methods=["PUT"])
def update_application(id):
    data = request.get_json(silent=True)

    # Check required information
    if not isinstance(data, dict):
        return {"error": "Invalid application data"}, 400

    if not all(data.get(field) for field in
               ["company", "position", "status"]):
        return {"error": "Missing required fields"}, 400

    connection = get_db()
    cursor = connection.cursor()

    cursor.execute("""
        UPDATE applications
        SET company = ?, position = ?, status = ?,
            date_applied = ?, notes = ?
        WHERE id = ?
    """, (
        data["company"],
        data["position"],
        data["status"],
        data.get("date_applied", ""),
        data.get("notes", ""),
        id
    ))

    updated = cursor.rowcount
    connection.commit()
    connection.close()

    if updated == 0:
        return {"error": "Application not found"}, 404

    return {"message": "Application updated successfully"}

# Delete a job application
@app.route("/applications/<int:id>", methods=["DELETE"])
def delete_application(id):
    connection = get_db()
    cursor = connection.cursor()

    cursor.execute("DELETE FROM applications WHERE id = ?", (id,))

    deleted = cursor.rowcount
    connection.commit()
    connection.close()

    if deleted == 0:
        return {"error": "Application not found"}, 404

    return {"message": "Application deleted successfully"}

# Start the server
if __name__ == "__main__":
    app.run(debug=True, port=8000)