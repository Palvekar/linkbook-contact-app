import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { API_URL } from "../config";

function Register() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [showPopup, setShowPopup] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const navigate = useNavigate();

    const showMessage = (text) => {
        setMessage(text);
        setShowPopup(true);

        setTimeout(() => {
            setShowPopup(false);
        }, 3000);

        setTimeout(() => {
            setMessage("");
        }, 3400);
    };

    const handleRegister = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch(
                `${API_URL}/api/auth/register`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        name: name,
                        email: email,
                        password: password
                    })
                }
            );

            const data = await response.json();

            if (response.ok) {
                showMessage("Account created successfully!");

                setTimeout(() => {
                    navigate("/");
                }, 800);
            } else {
                showMessage(data.message);
            }
        } catch (error) {
            console.error("Register Error:", error);
            showMessage("Unable to connect to server");
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">

                <div className="logo">
                    ♧
                </div>

                <h1>Create your LinkBook account</h1>

                <p className="subtitle">
                    Start managing your contacts securely.
                </p>

                <form onSubmit={handleRegister}>

                    <div className="form-group">
                        <label>Name</label>

                        <input
                            type="text"
                            placeholder="Enter your name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label>Email</label>

                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>

                        <div className="password-input-wrapper">
                            <input
                                type={isPasswordVisible ? "text" : "password"}
                                placeholder="Create a password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />

                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() =>
                                    setIsPasswordVisible(!isPasswordVisible)
                                }
                            >
                                {isPasswordVisible ? <FaEye /> : <FaEyeSlash />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="login-btn"
                    >
                        Create Account
                    </button>

                </form>

                {message && (
                    <div
                        className={`login-popup ${
                            message === "Account created successfully!"
                                ? "success"
                                : "error"
                        } ${
                            showPopup
                                ? "popup-show"
                                : "popup-hide"
                        }`}
                    >
                        <span className="popup-icon">
                            {message === "Account created successfully!"
                                ? "✓"
                                : "✕"}
                        </span>

                        <span>
                            {message}
                        </span>
                    </div>
                )}

                <p className="register-text">
                    Already have an account?

                    <button
                        type="button"
                        className="link-btn"
                        onClick={() => navigate("/")}
                    >
                        Login
                    </button>
                </p>

            </div>
        </div>
    );
}

export default Register;