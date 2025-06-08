import React, {useEffect, useState} from 'react';
import { useNavigate } from "react-router-dom";
import { useLocation } from 'react-router-dom';



// The Staff Home page.
export default function RoomPage() {
    const navigate = useNavigate();

    const [username, setUsername] = useState([]);
    const [loginType, setLoginType] = useState([]);
    const [name, setName] = useState([]);
    const [modules, setModules] = useState([]);

    // Upon loading gts all the data from the session and the backend.
    useEffect(() => {
        sessionStorage.setItem("EditForm", false);
        setUsername(sessionStorage.getItem("Username"));
        setLoginType(sessionStorage.getItem("LoginType"));
        // Gets the name of the staff memeber.
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
                setName(data);
            }
        })
        .catch(error => console.error(error))
        // Gets all the modules the staff can review and edit.
        fetch("/api/get-staff-review-modules", {
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

    // Naviagtes to the Review Requests page.
    function ReviewRequests() {
        navigate("/staff-decision-page");
    }

    // Navigates to the Decision History page.
    function ViewHistory() {
        navigate("/decision-history-page");
    }

    // Searches for a student and naviagates to their history page.
    function SearchStudentHistory() {
        let studentID = document.getElementById("usernameEnter").value;
        if (studentID === "") {
            return;
        }
        sessionStorage.setItem("studentRequest", false);
        sessionStorage.setItem("studentID", studentID);
        navigate("/student-history-page");
    }

    // Navigates to the Create New Form page if the module code entered is unique.
    function CreateNewModule() {
        let moduleCode = document.getElementById("newModuleEnter").value;
        if (moduleCode === "") {
            return;
        }
        fetch("/api/module-not-exist", {
            method: 'POST',
            body: JSON.stringify({data: moduleCode}),
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data === "VALID") {
                sessionStorage.setItem("NewModuleCode", moduleCode);
                navigate("/new-module-page");
            }
            else if (data === "INVALID") {
                alert("Sorry, that module already exists.")
            }
        });
    }

    // Navigates to the Edit Form page of the entered module.
    function EditModule() {
        let moduleCode = document.getElementById("moduleSelected").value;
        sessionStorage.setItem("NewModuleCode", moduleCode);
        sessionStorage.setItem("EditForm", true);

        navigate("/edit-module-page");
    }

    // Displays the drop down of module options.
    function ModuleOptions() {
        let rows = [];
        for (let module of modules) {
            rows.push(
                <option value={module.moduleCode}>{module.moduleCode}</option>
            );
        }
        return rows;
    }


// The HTML.
return <div className="staff-home-page">
<div>
    <h1>You are signed in as {name}</h1>
    <button type="button" id="button" onClick={ReviewRequests} >Review Requests</button> 
    <p></p>
    <button type="button" id="button" onClick={ViewHistory} >Decision History</button> 

    <p>Search Student History: </p>
    <input type="text" id ="usernameEnter" placeholder="Student ID" required/>
    <button type="button" id="button" onClick={SearchStudentHistory}>Search</button>

    <p>Create a new module request form: </p>
    <input type="text" id ="newModuleEnter" placeholder="Module Code" required/>
    <button type="button" id="button" onClick={CreateNewModule}>Start</button>

    <p>Edit existing module request form: </p>
    <select id="moduleSelected">
        <ModuleOptions/>
    </select>
    <button type="button" id="button" onClick={EditModule}>Start</button>
</div>

</div>
}