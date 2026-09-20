function Navbar() {
    return (
        <nav className="navbar navbar-expand-lg navbar-dark custom-navbar">
            <div className="container">

                <a className="navbar-brand fw-bold" href="#">
                    📒 ContactBook
                </a>

                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarContent"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div
                    className="collapse navbar-collapse"
                    id="navbarContent"
                >
                    <ul className="navbar-nav ms-auto align-items-lg-center">

                        <li className="nav-item">
                            <a className="nav-link active" href="#">
                                Contacts
                            </a>
                        </li>

                        <li className="nav-item ms-lg-3">
                            <button className="btn add-contact-btn">
                                + Add Contact
                            </button>
                        </li>

                        <li className="nav-item ms-lg-3">
                            <button className="btn logout-btn">
                                Logout
                            </button>
                        </li>

                    </ul>
                </div>

            </div>
        </nav>
    );
}

export default Navbar;