import sqlite3

# Connect to the database
connection = sqlite3.connect("applications.db")

# Create a cursor to execute SQL commands
cursor = connection.cursor()

# Create the applications table
cursor.execute("""
    CREATE TABLE IF NOT EXISTS applications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        company TEXT NOT NULL,
        position TEXT NOT NULL,
        status TEXT NOT NULL,
        date_applied TEXT,
        notes TEXT
    )
""")

# Save the changes
connection.commit()

# Close the database connection
connection.close()

print("Database created successfully")