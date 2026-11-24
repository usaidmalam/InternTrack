import { useState, useEffect } from 'react'
import './App.css'

const API_URL = "/applications"

function App() {

    // Store job applications
    const [applications, setApplications] = useState([])

    // Form information
    const [company, setCompany] = useState("")
    const [position, setPosition] = useState("")
    const [status, setStatus] = useState("Applied")
    const [dateApplied, setDateApplied] = useState("")
    const [notes, setNotes] = useState("")

    const [editingId, setEditingId] = useState(null)

    // Search and filtering
    const [search, setSearch] = useState("")
    const [filter, setFilter] = useState("All")

    const [error, setError] = useState("")

    // Get applications from the backend
    async function getApplications() {
        try {
            const response = await fetch(API_URL)

            if (!response.ok) {
                throw new Error("Could not load applications")
            }

            const data = await response.json()
            setApplications(data)
            setError("")
        } catch {
            setError("Could not connect to the backend.")
        }
    }

    // Load applications when the website opens
    useEffect(() => {
        getApplications()
    }, [])

    // Add or update an application
    async function addApplication(event) {
        event.preventDefault()

        const application = {
            company: company.trim(),
            position: position.trim(),
            status: status,
            date_applied: dateApplied,
            notes: notes
        }

        if (!application.company || !application.position) {
            setError("Company and position are required.")
            return
        }

        let url = API_URL
        let method = "POST"

        if (editingId !== null) {
            url = url + "/" + editingId
            method = "PUT"
        }

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(application)
            })

            if (!response.ok) {
                throw new Error("Could not save application")
            }

            clearForm()
            getApplications()
        } catch {
            setError("Could not save application.")
        }
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

    // Edit an application
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

        try {
            const response = await fetch(API_URL + "/" + id, {
                method: "DELETE"
            })

            if (!response.ok) {
                throw new Error("Could not delete application")
            }

            if (editingId === id) {
                clearForm()
            }

            getApplications()
        } catch {
            setError("Could not delete application.")
        }
    }

    // Download applications as a CSV file
    async function exportApplications() {
        try {
            const response = await fetch(API_URL + "/export")

            if (!response.ok) {
                throw new Error("Export failed")
            }

            const file = await response.blob()
            const url = URL.createObjectURL(file)

            const link = document.createElement("a")
            link.href = url
            link.download = "applications.csv"

            document.body.appendChild(link)
            link.click()
            link.remove()

            URL.revokeObjectURL(url)
            setError("")
        } catch {
            setError("Could not export applications.")
        }
    }

    // Dashboard statistics
    const total = applications.length

    const applied = applications.filter(
        app => app.status === "Applied"
    ).length

    const interviews = applications.filter(
        app => app.status === "Interview"
    ).length

    const offers = applications.filter(
        app => app.status === "Offer"
    ).length

    const rejected = applications.filter(
        app => app.status === "Rejected"
    ).length

    // Search and filter applications
    const filteredApplications = applications.filter(app => {

        const matchesSearch =
            app.company.toLowerCase().includes(search.toLowerCase()) ||
            app.position.toLowerCase().includes(search.toLowerCase())

        const matchesFilter =
            filter === "All" || app.status === filter

        return matchesSearch && matchesFilter
    })

    return (
        <div>
            <header>
                <h1>InternTrack</h1>
                <p>Manage and track your job applications.</p>
            </header>

            {error && (
                <p className="error-message">{error}</p>
            )}

            <div className="dashboard">

                <div className="stat-card">
                    <p>Total Applications</p>
                    <h2>{total}</h2>
                </div>

                <div className="stat-card applied-card">
                    <p>Applied</p>
                    <h2>{applied}</h2>
                </div>

                <div className="stat-card interview-card">
                    <p>Interviews</p>
                    <h2>{interviews}</h2>
                </div>

                <div className="stat-card offer-card">
                    <p>Offers</p>
                    <h2>{offers}</h2>
                </div>

                <div className="stat-card rejected-card">
                    <p>Rejected</p>
                    <h2>{rejected}</h2>
                </div>

            </div>

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

            <div className="filter-container">

                <input
                    type="text"
                    placeholder="Search company or position..."
                    aria-label="Search applications"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />

                <select
                    aria-label="Filter by status"
                    value={filter}
                    onChange={e => setFilter(e.target.value)}
                >
                    <option value="All">All Statuses</option>
                    <option>Applied</option>
                    <option>Interview</option>
                    <option>Offer</option>
                    <option>Rejected</option>
                </select>

                <button onClick={exportApplications}>
                    Export CSV
                </button>

            </div>

            <p className="results-count">
                Showing {filteredApplications.length} of {total} applications
            </p>

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

                        {filteredApplications.length === 0 && (
                            <tr>
                                <td colSpan="6">
                                    No applications found.
                                </td>
                            </tr>
                        )}

                        {filteredApplications.map(application => (
                            <tr key={application.id}>

                                <td>{application.company}</td>
                                <td>{application.position}</td>

                                <td>
                                    <span className={
                                        "status " + application.status.toLowerCase()
                                    }>
                                        {application.status}
                                    </span>
                                </td>

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