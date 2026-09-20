import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { FaUser, FaShieldAlt } from "react-icons/fa";

function Login() {

const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [message, setMessage] = useState("");
const [showPopup, setShowPopup] = useState(false);
const [isPasswordVisible, setIsPasswordVisible] = useState(false);
const [role, setRole] = useState("member"); // "member" | "admin"
const navigate = useNavigate();


    // Show popup
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


    const handleLogin = async (e) => {

        e.preventDefault();

        try {

            // Optional: hit a different endpoint for admin logins
            const endpoint = "http://localhost:5000/api/auth/login";

            const response = await fetch(
                endpoint,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        email: email,
                        password: password,
                        role: role
                    })
                }
            );


            const data = await response.json();


        if (response.ok) {

    localStorage.setItem("token", data.token);
    localStorage.setItem("role", data.role);

    showMessage("Login successful!");

    console.log("JWT Token:", data.token);

    setTimeout(() => {
        navigate(data.role === "admin" ? "/admin/dashboard" : "/dashboard");
    }, 500);

}
        
             else {
                showMessage(data.message);
             }
    }
               catch (error) {

            console.error("Login Error:", error);
            showMessage("Unable to connect to server");
        }
    };


    return (

        <div className="login-page">

            <div className="login-card">

                <div className="logo">
                 ♧
                </div>


                <h1>Welcome to LinkBook</h1>


                <p className="subtitle">
                    Manage your contacts securely in one place.
                </p>

                {/* Role toggle: Member / Admin */}
                <div className="role-toggle">

                    <button
                        type="button"
                        className={`role-btn ${role === "member" ? "active" : ""}`}
                        onClick={() => setRole("member")}
                    >
                        <FaUser className="role-icon" />
                        Member
                    </button>

                    <button
                        type="button"
                        className={`role-btn ${role === "admin" ? "active" : ""}`}
                        onClick={() => setRole("admin")}
                    >
                        <FaShieldAlt className="role-icon" />
                        Admin
                    </button>

                </div>


                <form onSubmit={handleLogin}>

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
            placeholder="Enter your password"
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
                        {role === "admin" ? "Login as Admin" : "Login"}
                    </button>

                </form>


                {/* Popup Message */}

                {message && (

                    <div
                        className={`login-popup ${
                            message === "Login successful!"
                                ? "success"
                                : "error"
                        } ${
                            showPopup
                                ? "popup-show"
                                : "popup-hide"
                        }`}
                    >

                        <span className="popup-icon">

                            {message === "Login successful!"
                                ? "✓"
                                : "✕"}

                        </span>


                        <span>
                            {message}
                        </span>

                    </div>

                )}


                <p className="register-text">

                    Don't have an account?
             
                <button
                    type="button"
                    className="link-btn"
                    onClick={() => navigate("/register")}
                >
                    Create Account
                </button>
                    

                </p>

            </div>

        </div>
    );
}

export default Login;