import React, {useEffect, useState} from 'react';
import { useNavigate } from "react-router-dom";
import { useLocation } from 'react-router-dom';
//import './style.css';

// The Student Home page.
export default function StudentHomePage() {
    const navigate = useNavigate();
    const [username, setUsername] = useState([]);
    const [loginType, setLoginType] = useState([]);
    const [name, setName] = useState([]);
    const [modules, setModules] = useState([]);

    // Upon loading, the data is gotten from the session and the backend.
    useEffect(() => {
        setUsername(sessionStorage.getItem("Username"));
        setLoginType(sessionStorage.getItem("LoginType"));
        // Gets the name of the student.
        fetch("/api/get-name", {
            method: 'POST',
            body: JSON.stringify({data: [sessionStorage.getItem("Username"), sessionStorage.getItem("LoginType")]}),
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data === "INVALID") {
                alert("Access Denied.");
            }
            else {
                console.log(data);
                setName(data);
            }
        })
        .catch(error => console.error(error))

        fetch("/api/get-student-modules", {
            method: 'POST',
            body: JSON.stringify({data: [sessionStorage.getItem("Username"), sessionStorage.getItem("LoginType")]}),
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data === "INVALID") {
                alert("Access Denied.");
            }
            else {
                setModules(data);
            }
        })
        .catch(error => console.error(error))
    }, []);

    // Displays the modules the student is enrolled in and can make a request for.
    function ModuleOptions() {
        let rows = [];
        for (let module of modules) {
            rows.push(
                <option value={module.moduleCode}>{module.moduleCode}</option>
            );
        }
        return rows;
    }

    // Navigates to the New Request page of the selected module.
    function NewRequest() {
        let moduleSelected = document.getElementById("moduleSelected").value;
        sessionStorage.setItem("module", moduleSelected);
        navigate("/new-request-page");
    }

    // Navigates to the students Request History Page.
    function ViewHistory() {
        sessionStorage.setItem("studentRequest", true);
        sessionStorage.setItem("studentID", username);
        navigate("/student-history-page");
    }


    // The HTML.
    return <div className="student-home-page">
        <div>
            <h1>You are signed in as {name}</h1>
            <p>Make a new request:</p>
            <select id="moduleSelected">
                <ModuleOptions/>
            </select>
            <button type="button" id="button" onClick={NewRequest} >Start</button>
            <p></p>
            <button type="button" id="button" onClick={ViewHistory} >View your request history</button>
        </div>

    </div>
}

