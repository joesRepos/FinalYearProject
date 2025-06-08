import { useNavigate } from "react-router-dom";
import React, {useEffect, useState} from 'react';
import './styleSheet.css';

// For the Login Page
export default function LoginPage() {
    const navigate = useNavigate();

    // Checks if the details are correct and redirects to the appropriate page.
    function checkDetails() {
        let username = document.getElementById("usernameEnter").value;
        let loginType = document.getElementById("loginTypeSelect").value;

            // Sends the login details to the backend.
            fetch("/api/check-login-detail", {
                method: 'POST',
                body: JSON.stringify({data: [username, loginType]}),
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data === "VALID") {
                    sessionStorage.setItem("Username", username);
                    sessionStorage.setItem("LoginType", loginType);
                    switch (loginType) {
                        case "Student":
                            navigate("/student-home-page");
                            break;
                        case "Staff": 
                            navigate("/staff-home-page");
                            break;
                    }
                }
                else if (data === "INVALID") {
                    alert("Invalid credentials");
                }
            })
            .catch(error => console.error(error))
        
    }
    // The HTML.
    return <div className="login-page">
        <div>
            <h1>Extension Request</h1>
            <h1>System Login</h1>
            <p>Username: </p>
            <input type="text" id ="usernameEnter" placeholder="Username" required/>
            <p>Password</p>
            <input type="password" id ="passwordEnter" placeholder="Password" readOnly/>
            <p></p>
            <select id="loginTypeSelect">
                <option value="Student">Student</option>
                <option value="Staff">Staff</option>
            </select>
            <button type="button" id="button" onClick={checkDetails}>Login</button>
                
        </div>
    </div>;
}