import { useState, useEffect } from 'react'
import './App.css'

function App() {

    // Store job applications
    const [applications, setApplications] = useState([])

    // Store form information
    const [company, setCompany] = useState("")
    const [position, setPosition] = useState("")
    const [status, setStatus] = useState("Applied")
    const [dateApplied, setDateApplied] = useState("")
    const [notes, setNotes] = useState("")

    // Store the ID of the application being edited
    const [editingId, setEditingId] = useState(null)

    // Get applications from the backend
    async function getApplications() {
        const response = await fetch("http://127.0.0.1:8000/applications")
        const data = await response.json()
        setApplications(data)
    }

    // Load applications when the website opens
    useEffect(() => {
        getApplications()
    }, [])

    // Add or update an application
    async function addApplication(event) {

        event.preventDefault()

        const application = {
            company: company,
            position: position,
            status: status,
            date_applied: dateApplied,
            notes: notes
        }

        let url = "http://127.0.0.1:8000/applications"
        let method = "POST"

        // Use PUT when editing an application
        if (editingId !== null) {
            url = url + "/" + editingId
            method = "PUT"
        }

        const response = await fetch(url, {
            method: method,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(application)
        })

        if (!response.ok) {
            alert("Could not save application")
            return
        }

        clearForm()
        getApplications()
    }

    // Clear the form
    function clearForm() {
        setCompany("")
        setPosition("")
        setStatus("Applied")
        setDateApplied("")
        setNotes("")
        setEditingId(null)
    }

    // Load an application into the form
    function editApplication(application) {
        setCompany(application.company)
        setPosition(application.position)
        setStatus(application.status)
        setDateApplied(application.date_applied || "")
        setNotes(application.notes || "")
        setEditingId(application.id)
    }

    // Delete an application
    async function deleteApplication(id) {

        if (!window.confirm("Delete this application?")) {
            return
        }

        const response = await fetch(
            "http://127.0.0.1:8000/applications/" + id,
            {
                method: "DELETE"
            }
        )

        if (!response.ok) {
            alert("Could not delete application")
            return
        }

        if (editingId === id) {
            clearForm()
        }

        getApplications()
    }

    return (
        <div>
            <h1>InternTrack</h1>
            <p>Manage and track your job applications.</p>

            <h2>
                {editingId !== null ? "Edit Application" : "Add Application"}
            </h2>

            <form onSubmit={addApplication}>

                <input
                    type="text"
                    placeholder="Company"
                    aria-label="Company"
                    value={company}
                    onChange={e => setCompany(e.target.value)}
                    required
                />

                <input
                    type="text"
                    placeholder="Position"
                    aria-label="Position"
                    value={position}
                    onChange={e => setPosition(e.target.value)}
                    required
                />

                <select
                    aria-label="Application status"
                    value={status}
                    onChange={e => setStatus(e.target.value)}
                >
                    <option>Applied</option>
                    <option>Interview</option>
                    <option>Offer</option>
                    <option>Rejected</option>
                </select>

                <input
                    type="date"
                    aria-label="Date applied"
                    value={dateApplied}
                    onChange={e => setDateApplied(e.target.value)}
                    required
                />

                <input
                    type="text"
                    placeholder="Notes"
                    aria-label="Notes"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                />

                <button type="submit">
                    {editingId !== null ? "Save Changes" : "Add Application"}
                </button>

                {editingId !== null && (
                    <button
                        type="button"
                        className="cancel-button"
                        onClick={clearForm}
                    >
                        Cancel
                    </button>
                )}

            </form>

            <h2>Job Applications</h2>

            <p>Total applications: {applications.length}</p>

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Company</th>
                            <th>Position</th>
                            <th>Status</th>
                            <th>Date Applied</th>
                            <th>Notes</th>
                            <th>Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {applications.map(application => (
                            <tr key={application.id}>
                                <td>{application.company}</td>
                                <td>{application.position}</td>
                                <td>{application.status}</td>
                                <td>{application.date_applied}</td>
                                <td>{application.notes}</td>

                                <td>
                                    <button
                                        className="edit-button"
                                        onClick={() => editApplication(application)}
                                    >
                                        Edit
                                    </button>

                                    <button
                                        className="delete-button"
                                        onClick={() => deleteApplication(application.id)}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default App