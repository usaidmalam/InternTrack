from flask import Flask, request, jsonify, Response
from flask_cors import CORS
from pathlib import Path
from database import create_database
import sqlite3
import csv
import io

app = Flask(__name__)
CORS(app)

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


# Get all applications
@app.route("/applications", methods=["GET"])
def get_applications():
    connection = get_db()
    cursor = connection.cursor()

    cursor.execute("SELECT * FROM applications")
    applications = cursor.fetchall()

    connection.close()

    return jsonify([dict(row) for row in applications])


# Add an application
@app.route("/applications", methods=["POST"])
def add_application():
    data = request.get_json(silent=True)

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


# Update an application
@app.route("/applications/<int:id>", methods=["PUT"])
def update_application(id):
    data = request.get_json(silent=True)

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


# Delete an application
@app.route("/applications/<int:id>", methods=["DELETE"])
def delete_application(id):
    connection = get_db()
    cursor = connection.cursor()

    cursor.execute(
        "DELETE FROM applications WHERE id = ?",
        (id,)
    )

    deleted = cursor.rowcount

    connection.commit()
    connection.close()

    if deleted == 0:
        return {"error": "Application not found"}, 404

    return {"message": "Application deleted successfully"}


# Prevent spreadsheet formulas from running
def safe_csv_value(value):
    if isinstance(value, str):
        if value.lstrip().startswith(("=", "+", "-", "@")):
            return "'" + value

    return value


# Export applications as a CSV file
@app.route("/applications/export", methods=["GET"])
def export_applications():
    connection = get_db()
    cursor = connection.cursor()

    cursor.execute("""
        SELECT company, position, status, date_applied, notes
        FROM applications
    """)

    applications = cursor.fetchall()
    connection.close()

    # Create the CSV in memory
    output = io.StringIO()
    writer = csv.writer(output)

    # Write column headings
    writer.writerow([
        "Company",
        "Position",
        "Status",
        "Date Applied",
        "Notes"
    ])

    # Write each application
    for application in applications:
        writer.writerow([
            safe_csv_value(value) for value in application
        ])

    # Return the CSV as a downloadable file
    return Response(
        output.getvalue(),
        mimetype="text/csv",
        headers={
            "Content-Disposition":
                "attachment; filename=applications.csv"
        }
    )


# Start the server
if __name__ == "__main__":
    create_database(DB_PATH)
    app.run(debug=True, port=8000)