import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

function Dashboard() {

    const navigate = useNavigate();

    // =========================
    // CONTACTS STATE
    // =========================

    

    const [contacts, setContacts] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [search, setSearch] = useState("");


    // =========================
    // ADD CONTACT STATE
    // =========================

    const [showAddForm, setShowAddForm] = useState(false);

    const [newContact, setNewContact] = useState({
        name: "",
        phone: "",
        email: "",
        address: ""
    });

    const [image, setImage] = useState(null);


    // =========================
    // EDIT CONTACT STATE
    // =========================

    const [showEditForm, setShowEditForm] = useState(false);

    const [editContact, setEditContact] = useState({
        id: null,
        name: "",
        phone: "",
        email: "",
        address: ""
    });

    const [editImage, setEditImage] = useState(null);


    // =========================
    // DELETE CONTACT STATE
    // =========================

    const [showDeletePopup, setShowDeletePopup] = useState(false);

    const [deleteContactId, setDeleteContactId] = useState(null);


    // =========================
    // SUCCESS POPUP STATE
    // =========================

    const [message, setMessage] = useState("");

    const [showPopup, setShowPopup] = useState(false);

    // =========================
    // ADMIN STATE 
    // =========================

    const [role] = useState(localStorage.getItem("role"));
    const [showUsersPanel, setShowUsersPanel] = useState(false);
    const [allUsers, setAllUsers] = useState([]);
    const [usersLoading, setUsersLoading] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedUserContacts, setSelectedUserContacts] = useState([]);
    const [userContactsLoading, setUserContactsLoading] = useState(false);

    // =====================================================
    // FETCH CONTACTS
    // =====================================================

    const fetchContacts = async () => {

        const token = localStorage.getItem("token");

        // If token does not exist,
        // send user back to login page
        if (!token) {
            navigate("/");
            return;
        }

        try {

            setLoading(true);

            setError("");

            const response = await fetch(
                "http://localhost:5000/api/contacts",
                {
                    method: "GET",

                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (response.ok) {

                setContacts(data.contacts || []);

            } else {

                setError(
                    data.message || "Unable to fetch contacts"
                );
            }

        } catch (error) {

            console.error("Fetch Contacts Error:", error);

            setError("Unable to connect to server");

        } finally {

            setLoading(false);
        }
    };

    // =====================================================
    // FETCH ALL USERS (ADMIN ONLY)
    // =====================================================

    const fetchAllUsers = async () => {

        const token = localStorage.getItem("token");

        if (!token) {
            navigate("/");
            return;
        }

        try {

            setUsersLoading(true);

            const response = await fetch(
                "http://localhost:5000/api/admin/users",
                {
                    method: "GET",

                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (response.ok) {

                setAllUsers(data.users || []);

            } else {

                setError(
                    data.message || "Unable to fetch users"
                );
            }

        } catch (error) {

            console.error("Fetch Users Error:", error);

            setError("Unable to connect to server");

        } finally {

            setUsersLoading(false);
        }
    };

    // =====================================================
    // FETCH ONE USER'S CONTACTS (ADMIN ONLY)
    // =====================================================

    const handleViewUserContacts = async (user) => {

        const token = localStorage.getItem("token");

        setSelectedUser(user);
        setUserContactsLoading(true);

        try {

            const response = await fetch(
                `http://localhost:5000/api/admin/users/${user.id}/contacts`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (response.ok) {
                setSelectedUserContacts(data.contacts || []);
            } else {
                setError(data.message || "Unable to fetch user contacts");
            }

        } catch (error) {
            console.error("Fetch User Contacts Error:", error);
            setError("Unable to connect to server");
        } finally {
            setUserContactsLoading(false);
        }
    };
    // =====================================================
    // FETCH CONTACTS WHEN DASHBOARD LOADS
    // =====================================================

    useEffect(() => {

        fetchContacts();

    }, [navigate]);


    // =====================================================
    // SUCCESS MESSAGE
    // =====================================================

    const showMessage = (text) => {

        setMessage(text);

        setShowPopup(true);

        // Hide popup after 3 seconds
        setTimeout(() => {
            setShowPopup(false);
        }, 3000);

        // Remove message after animation
        setTimeout(() => {
            setMessage("");
        }, 3400);
    };


    // =====================================================
    // ADD CONTACT INPUT CHANGE
    // =====================================================

    const handleNewContactChange = (e) => {

        const { name, value } = e.target;

        setNewContact((prevContact) => ({
            ...prevContact,
            [name]: value
        }));
    };


    // =====================================================
    // ADD CONTACT
    // =====================================================

    const handleAddContact = async () => {

        // Validation
        if (
            !newContact.name.trim() ||
            !newContact.phone.trim()
        ) {

            setError("Name and phone are required");

            return;
        }

        const token = localStorage.getItem("token");

        if (!token) {

            navigate("/");

            return;
        }

        // FormData is required because
        // we are sending an image
        const formData = new FormData();

        formData.append(
            "name",
            newContact.name.trim()
        );

        formData.append(
            "phone",
            newContact.phone.trim()
        );

        formData.append(
            "email",
            newContact.email.trim()
        );

        formData.append(
            "address",
            newContact.address.trim()
        );

        // Add image only if user selected one
        if (image) {

            formData.append(
                "image",
                image
            );
        }

        try {

            const response = await fetch(
                "http://localhost:5000/api/contacts",
                {
                    method: "POST",

                    headers: {
                        Authorization: `Bearer ${token}`
                    },

                    body: formData
                }
            );

            const data = await response.json();

            if (response.ok) {

                // Refresh contacts
                await fetchContacts();

                // Clear form
                setNewContact({
                    name: "",
                    phone: "",
                    email: "",
                    address: ""
                });

                // Clear image
                setImage(null);

                // Close form
                setShowAddForm(false);

                // Clear old error
                setError("");

                // Show success message
                showMessage(
                    "Contact saved successfully!"
                );

            } else {

                setError(
                    data.message ||
                    "Unable to add contact"
                );
            }

        } catch (error) {

            console.error(
                "Add Contact Error:",
                error
            );

            setError(
                "Unable to connect to server"
            );
        }
    };


    // =====================================================
    // OPEN EDIT FORM
    // =====================================================

    const handleUpdateClick = (contact) => {

        setEditContact({
            id: contact.id,

            name: contact.name || "",

            phone: contact.phone || "",

            email: contact.email || "",

            address: contact.address || ""
        });

        // Reset selected image
        setEditImage(null);

        // Clear errors
        setError("");

        // Show edit form
        setShowEditForm(true);
    };


    // =====================================================
    // EDIT CONTACT INPUT CHANGE
    // =====================================================

    const handleEditContactChange = (e) => {

        const { name, value } = e.target;

        setEditContact((prevContact) => ({
            ...prevContact,
            [name]: value
        }));
    };


    // =====================================================
    // UPDATE CONTACT
    // =====================================================

    const handleUpdateContact = async () => {

        // Validation
        if (
            !editContact.name.trim() ||
            !editContact.phone.trim()
        ) {

            setError(
                "Name and phone are required"
            );

            return;
        }

        const token = localStorage.getItem("token");

        if (!token) {

            navigate("/");

            return;
        }

        const formData = new FormData();

        formData.append(
            "name",
            editContact.name.trim()
        );

        formData.append(
            "phone",
            editContact.phone.trim()
        );

        formData.append(
            "email",
            editContact.email.trim()
        );

        formData.append(
            "address",
            editContact.address.trim()
        );

        // Add new image only if selected
        if (editImage) {

            formData.append(
                "image",
                editImage
            );
        }

        try {

            const response = await fetch(
                `http://localhost:5000/api/contacts/${editContact.id}`,
                {
                    method: "PUT",

                    headers: {
                        Authorization: `Bearer ${token}`
                    },

                    body: formData
                }
            );

            const data = await response.json();

            if (response.ok) {

                // Refresh contacts
                await fetchContacts();

                // Close edit form
                setShowEditForm(false);

                // Reset edit contact
                setEditContact({
                    id: null,
                    name: "",
                    phone: "",
                    email: "",
                    address: ""
                });

                // Reset edit image
                setEditImage(null);

                // Clear error
                setError("");

                // Show success message
                showMessage(
                    "Contact updated successfully!"
                );

            } else {

                setError(
                    data.message ||
                    "Unable to update contact"
                );
            }

        } catch (error) {

            console.error(
                "Update Contact Error:",
                error
            );

            setError(
                "Unable to connect to server"
            );
        }
    };


    // =====================================================
    // OPEN DELETE POPUP
    // =====================================================

    const handleDeleteClick = (id) => {

        // Store selected contact ID
        setDeleteContactId(id);

        // Open custom popup
        setShowDeletePopup(true);

        // Clear old error
        setError("");
    };


    // =====================================================
    // CLOSE DELETE POPUP
    // =====================================================

    const handleCancelDelete = () => {

        setShowDeletePopup(false);

        setDeleteContactId(null);
    };


    // =====================================================
    // DELETE CONTACT
    // =====================================================

    const handleDelete = async () => {

        // Make sure an ID exists
        if (!deleteContactId) {

            return;
        }

        const token = localStorage.getItem("token");

        if (!token) {

            navigate("/");

            return;
        }

        try {

            const response = await fetch(
                `http://localhost:5000/api/contacts/${deleteContactId}`,
                {
                    method: "DELETE",

                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (response.ok) {

                // Remove contact from UI
                setContacts((prevContacts) =>
                    prevContacts.filter(
                        (contact) =>
                            contact.id !== deleteContactId
                    )
                );

                // Close popup
                setShowDeletePopup(false);

                // Clear ID
                setDeleteContactId(null);

                // Clear error
                setError("");

                // Success message
                showMessage(
                    "Contact deleted successfully!"
                );

            } else {

                setError(
                    data.message ||
                    "Unable to delete contact"
                );
            }

        } catch (error) {

            console.error(
                "Delete Contact Error:",
                error
            );

            setError(
                "Unable to connect to server"
            );
        }
    };
// =====================================================
// GET CONTACT INITIALS
// =====================================================

const getInitials = (name) => {

    if (!name) {
        return "?";
    }

    const words = name.trim().split(/\s+/);

    // Single name
    if (words.length === 1) {
        return words[0].charAt(0).toUpperCase();
    }

    // First name + last name
    return (
        words[0].charAt(0) +
        words[words.length - 1].charAt(0)
    ).toUpperCase();
};

const highlightText = (text, searchValue) => {

    if (!searchValue) {
        return text;
    }

    const textString = String(text || "");

    const parts = textString.split(
        new RegExp(`(${searchValue})`, "gi")
    );

    return parts.map((part, index) => {

        if (
            part.toLowerCase() ===
            searchValue.toLowerCase()
        ) {

            return (
                <mark key={index}>
                    {part}
                </mark>
            );
        }

        return part;
    });
};
    // =====================================================
    // SEARCH CONTACTS
    // =====================================================

    const filteredContacts = contacts.filter(
        (contact) => {

            const name = (
                contact.name || ""
            ).toLowerCase();

            const phone = (
                contact.phone || ""
            ).toString();

            const email = (
                contact.email || ""
            ).toLowerCase();

            const searchText =
                search.toLowerCase();

            return (
                name.includes(searchText) ||
                phone.includes(searchText) ||
                email.includes(searchText)
            );
        }
    );


    // =====================================================
    // LOGOUT
    // =====================================================

    const handleLogout = () => {

        localStorage.removeItem("token");

        navigate("/");
    };


    // =====================================================
    // CANCEL ADD FORM
    // =====================================================

    const handleCancelAdd = () => {

        setShowAddForm(false);

        setNewContact({
            name: "",
            phone: "",
            email: "",
            address: ""
        });

        setImage(null);

        setError("");
    };


    // =====================================================
    // CANCEL EDIT FORM
    // =====================================================

    const handleCancelEdit = () => {

        setShowEditForm(false);

        setEditContact({
            id: null,
            name: "",
            phone: "",
            email: "",
            address: ""
        });

        setEditImage(null);

        setError("");
    };


    // =====================================================
    // JSX
    // =====================================================

    return (

        <div className="dashboard-page">

            {/* =========================================
                NAVBAR
            ========================================= */}

            <nav className="dashboard-navbar">

                <div className="dashboard-logo">
                    LinkBook
                </div>

                <button
                    className="logout-btn"
                    onClick={handleLogout}
                >
                    Logout
                </button>

            </nav>


            {/* =========================================
                MAIN CONTENT
            ========================================= */}

            <main className="dashboard-container">


                {/* =====================================
                    HEADER
                ===================================== */}

                <div className="dashboard-header">

                    <h1>
                        Welcome back!
                    </h1>

                    <p>
                        Manage your contacts easily
                        in one place.
                    </p>

                </div>


                {/* =====================================
                    SUCCESS POPUP
                ===================================== */}

                {message && (

                    <div
                        className={`dashboard-popup ${
                            showPopup
                                ? "popup-show"
                                : "popup-hide"
                        }`}
                    >

                        <span className="popup-icon">
                            ✓
                        </span>

                        <span>
                            {message}
                        </span>

                    </div>

                )}


                {/* =====================================
                    SEARCH
                ===================================== */}

                <div className="search-section">

                    <input
                        type="text"
                        placeholder="Search contacts..."
                        value={search}
                        onChange={(e) =>
                            setSearch(e.target.value)
                        }
                    />

                </div>


                {/* =====================================
                    CONTACT HEADER
                ===================================== */}

                              <div className="contacts-header">

                    <h2>
                        Your Contacts
                    </h2>

                                     <div className="contacts-header-actions">

                        <button
                            className="add-contact-btn"
                            onClick={() => {

                                setShowAddForm(true);

                                setShowEditForm(false);

                                setError("");
                            }}
                        >
                            + Add Contact
                        </button>

                        {role === "admin" && (

                            <button
                                className="add-contact-btn"
                                onClick={() => {

                                    setSelectedUser(null);

                                    setShowUsersPanel(true);

                                    fetchAllUsers();
                                }}
                            >
                                Manage Users
                            </button>

                        )}

                    </div>

                </div>


                {/* =====================================
                    ADD CONTACT FORM
                ===================================== */}

                {showAddForm && (

                    <div className="add-contact-form">

                        <h2>
                            Add New Contact
                        </h2>


                        {/* Name */}

                        <input
                            type="text"
                            name="name"
                            placeholder="Name"
                            value={newContact.name}
                            onChange={
                                handleNewContactChange
                            }
                        />


                        {/* Phone */}

                        <input
                            type="text"
                            name="phone"
                            placeholder="Phone"
                            value={newContact.phone}
                            onChange={
                                handleNewContactChange
                            }
                        />


                        {/* Email */}

                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={newContact.email}
                            onChange={
                                handleNewContactChange
                            }
                        />


                        {/* Address */}

                        <input
                            type="text"
                            name="address"
                            placeholder="Address"
                            value={newContact.address}
                            onChange={
                                handleNewContactChange
                            }
                        />


                        {/* Image */}

                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {

                                const selectedFile =
                                    e.target.files?.[0];

                                setImage(
                                    selectedFile || null
                                );
                            }}
                        />


                        {/* Buttons */}

                        <div className="form-buttons">

                            <button
                                className="save-contact-btn"
                                onClick={
                                    handleAddContact
                                }
                            >
                                Save Contact
                            </button>


                            <button
                                className="cancel-btn"
                                onClick={
                                    handleCancelAdd
                                }
                            >
                                Cancel
                            </button>

                        </div>

                    </div>

                )}


                {/* =====================================
                    EDIT CONTACT FORM
                ===================================== */}

                {showEditForm && (

                    <div className="add-contact-form">

                        <h2>
                            Update Contact
                        </h2>


                        {/* Name */}

                        <input
                            type="text"
                            name="name"
                            placeholder="Name"
                            value={editContact.name}
                            onChange={
                                handleEditContactChange
                            }
                        />


                        {/* Phone */}

                        <input
                            type="text"
                            name="phone"
                            placeholder="Phone"
                            value={editContact.phone}
                            onChange={
                                handleEditContactChange
                            }
                        />


                        {/* Email */}

                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={editContact.email}
                            onChange={
                                handleEditContactChange
                            }
                        />


                        {/* Address */}

                        <input
                            type="text"
                            name="address"
                            placeholder="Address"
                            value={editContact.address}
                            onChange={
                                handleEditContactChange
                            }
                        />


                        {/* New Image */}

                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {

                                const selectedFile =
                                    e.target.files?.[0];

                                setEditImage(
                                    selectedFile || null
                                );
                            }}
                        />


                        {/* Buttons */}

                        <div className="form-buttons">

                            <button
                                className="save-contact-btn"
                                onClick={
                                    handleUpdateContact
                                }
                            >
                                Update Contact
                            </button>


                            <button
                                className="cancel-btn"
                                onClick={
                                    handleCancelEdit
                                }
                            >
                                Cancel
                            </button>

                        </div>

                    </div>

                )}


                {/* =====================================
                    LOADING
                ===================================== */}

                {loading && (

                    <p className="status-message">
                        Loading contacts...
                    </p>

                )}


                {/* =====================================
                    ERROR
                ===================================== */}

                {error && (

                    <p className="error-message">
                        {error}
                    </p>

                )}


                {/* =====================================
                    NO CONTACTS
                ===================================== */}

                {!loading &&
                    !error &&
                    filteredContacts.length === 0 && (

                    <p className="status-message">

                        {search
                            ? "No matching contacts found."
                            : "No contacts found."
                        }

                    </p>

                )}


                {/* =====================================
                    CONTACT GRID
                ===================================== */}

                {!loading &&
                    !error &&
                    filteredContacts.length > 0 && (

                    <div className="contacts-grid">

                        {filteredContacts.map(
                            (contact) => (

                            <div
                                className="contact-card"
                                key={contact.id}
                            >


                                {/* =====================
                                    CONTACT IMAGE
                                ===================== */}
    

<div className="contact-image">

    {contact.image_path ? (

        <img
            src={`http://localhost:5000/${contact.image_path}`}
            alt={contact.name || "Contact"}
        />

    ) : (

        <span className="contact-initials">
            {getInitials(contact.name)}
        </span>

    )}

</div>

                                {/* =====================
                                    CONTACT INFORMATION
                                ===================== */}

                                <div className="contact-info">

                                    <h3>
                                        {highlightText(contact.name, search)}
                                    </h3>


                                    <p>
                                        {highlightText(contact.phone, search)}
                                    </p>


                                    {contact.email && (

                                        <p>
                                            {highlightText(contact.email, search)}
                                        </p>

                                    )}


                                    {contact.address && (

                                        <p>
                                            {highlightText(contact.address, search)}
                                        </p>

                                    )}


                                    {/* =================
                                        ACTION BUTTONS
                                    ================= */}

                                    <div className="contact-actions">


                                        {/* UPDATE */}

                                        <button
                                            className="update-btn"
                                            onClick={() =>
                                                handleUpdateClick(
                                                    contact
                                                )
                                            }
                                        >
                                            Update
                                        </button>


                                        {/* DELETE */}

                                        <button
                                            className="delete-btn"
                                            onClick={() =>
                                                handleDeleteClick(
                                                    contact.id
                                                )
                                            }
                                        >
                                            Delete
                                        </button>

                                    </div>

                                </div>

                            </div>

                        ))}

                    </div>

                )}


                {/* =====================================
                    DELETE CONFIRMATION POPUP
                ===================================== */}

                {showDeletePopup && (

                    <div className="delete-overlay">

                        <div className="delete-modal">


                            {/* Icon */}

                            <div className="delete-modal-icon">
                                !
                            </div>


                            {/* Title */}

                            <h2>
                                Delete Contact?
                            </h2>


                            {/* Message */}

                            <p>
                                Are you sure you want
                                to delete this contact?
                            </p>


                            {/* Buttons */}

                            <div className="delete-modal-actions">


                                {/* Cancel */}

                                <button
                                    className="cancel-delete-btn"
                                    onClick={
                                        handleCancelDelete
                                    }
                                >
                                    Cancel
                                </button>


                                {/* Confirm Delete */}

                                <button
                                    className="confirm-delete-btn"
                                    onClick={
                                        handleDelete
                                    }
                                >
                                    Delete
                                </button>

                            </div>

                        </div>

                    </div>

                )}
                                            {/* =====================================
                    ADMIN: MANAGE USERS PANEL
                ===================================== */}

                {showUsersPanel && (

                    <div className="delete-overlay">

                        <div className="users-modal">

                            {!selectedUser && (
                                <>
                                    <h2>All Users</h2>

                                    {usersLoading && (
                                        <p className="status-message">Loading users...</p>
                                    )}

                                    {!usersLoading && allUsers.length === 0 && (
                                        <p className="status-message">No users found.</p>
                                    )}

                                    {!usersLoading && allUsers.length > 0 && (

                                        <table className="users-table">
                                            <thead>
                                                <tr>
                                                    <th>Name</th>
                                                    <th>Email</th>
                                                    <th>Role</th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                {allUsers.map((user) => (
                                                    <tr
                                                        key={user.id}
                                                        className="users-table-row"
                                                        onClick={() => handleViewUserContacts(user)}
                                                    >
                                                        <td>{user.name}</td>
                                                        <td>{user.email}</td>
                                                        <td>
                                                            <span className={`role-badge ${user.role}`}>
                                                                {user.role}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>

                                    )}

                                    <div className="delete-modal-actions">
                                        <button
                                            className="cancel-delete-btn"
                                            onClick={() => setShowUsersPanel(false)}
                                        >
                                            Close
                                        </button>
                                    </div>
                                </>
                            )}

                            {selectedUser && (
                                <>
                                    <h2>{selectedUser.name}'s Contacts</h2>

                                    {userContactsLoading && (
                                        <p className="status-message">Loading contacts...</p>
                                    )}

                                    {!userContactsLoading && selectedUserContacts.length === 0 && (
                                        <p className="status-message">This user has no contacts.</p>
                                    )}

                                    {!userContactsLoading && selectedUserContacts.length > 0 && (

                                        <div className="user-contacts-list">

                                            {selectedUserContacts.map((contact) => (
                                                <div className="user-contact-item" key={contact.id}>

                                                    <div className="contact-image">
                                                        {contact.image_path ? (
                                                            <img
                                                                src={`http://localhost:5000/${contact.image_path}`}
                                                                alt={contact.name || "Contact"}
                                                            />
                                                        ) : (
                                                            <span className="contact-initials">
                                                                {getInitials(contact.name)}
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div>
                                                        <h3>{contact.name}</h3>
                                                        <p>{contact.phone}</p>
                                                        {contact.email && <p>{contact.email}</p>}
                                                        {contact.address && <p>{contact.address}</p>}
                                                    </div>

                                                </div>
                                            ))}

                                        </div>

                                    )}

                                    <div className="delete-modal-actions">
                                        <button
                                            className="cancel-delete-btn"
                                            onClick={() => setSelectedUser(null)}
                                        >
                                            Back to Users
                                        </button>
                                    </div>
                                </>
                            )}

                        </div>

                    </div>

                )}

            </main>

        </div>
    );
}

export default Dashboard;



