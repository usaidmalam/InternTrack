import pytest
import app as backend
from database import create_database


# Create a separate database for testing
@pytest.fixture
def client(tmp_path, monkeypatch):

    test_db = tmp_path / "test.db"

    create_database(test_db)

    monkeypatch.setattr(backend, "DB_PATH", test_db)

    backend.app.config["TESTING"] = True

    return backend.app.test_client()


# Sample application used in tests
def sample_application():

    return {
        "company": "Amazon",
        "position": "Software Intern",
        "status": "Applied",
        "date_applied": "2026-11-24",
        "notes": "Test application"
    }


# Test the home endpoint
def test_home(client):

    response = client.get("/")

    assert response.status_code == 200


# Test getting applications
def test_get_applications(client):

    response = client.get("/applications")

    assert response.status_code == 200
    assert response.get_json() == []


# Test adding an application
def test_add_application(client):

    response = client.post(
        "/applications",
        json=sample_application()
    )

    assert response.status_code == 201

    applications = client.get("/applications").get_json()

    assert len(applications) == 1
    assert applications[0]["company"] == "Amazon"


# Test updating an application
def test_update_application(client):

    application = sample_application()

    client.post("/applications", json=application)

    application["status"] = "Interview"

    response = client.put(
        "/applications/1",
        json=application
    )

    assert response.status_code == 200

    applications = client.get("/applications").get_json()

    assert applications[0]["status"] == "Interview"


# Test deleting an application
def test_delete_application(client):

    client.post(
        "/applications",
        json=sample_application()
    )

    response = client.delete("/applications/1")

    assert response.status_code == 200
    assert client.get("/applications").get_json() == []


# Test missing information
def test_invalid_application(client):

    response = client.post("/applications", json={})

    assert response.status_code == 400


# Test deleting an application that does not exist
def test_delete_missing_application(client):

    response = client.delete("/applications/999")

    assert response.status_code == 404


# Test updating an application that does not exist
def test_update_missing_application(client):

    response = client.put(
        "/applications/999",
        json=sample_application()
    )

    assert response.status_code == 404