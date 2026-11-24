from flask import Flask

# Create the Flask application
app = Flask(__name__)

# Create our first API route
@app.route("/")
def home():
    return {"message": "InternTrack API is running"}

# Start the server
if __name__ == "__main__":
    app.run(debug=True, port=8000)