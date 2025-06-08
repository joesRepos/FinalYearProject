import React, {useEffect, useState} from 'react';
import { useNavigate } from "react-router-dom";
import { useLocation } from 'react-router-dom';
//import './style.css';

// The Review Requests page.
export default function CreateNewModulePage() {
    const [allRequest, setAllRequest] = useState([]);
    const [staffID, setStaffID] = useState([]);

    // Upon loading, fetches all the data from the session storage and backend.
    useEffect(() => {
        setStaffID(sessionStorage.getItem("Username"));
        fetch("/api/get-pending-staff-decisions", {
            method: 'POST',
            body: JSON.stringify({data: [sessionStorage.getItem("Username")]}),
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            setAllRequest(data);
        });
    }, []);

    // Approves the current request.
    function ApproveRequest(requestID) {
        const currentDate = new Date();
        let dateTime = {
            day: currentDate.getDate(),
            month: currentDate.getMonth() + 1,
            year: currentDate.getFullYear(),
            hour: currentDate.getHours(),
            minutes: currentDate.getMinutes()
        }
        let decision = "Approved";
        let othersDecision = "Otherwsie Decided";
        fetch("/api/change-request-status", {
            method: 'POST',
            body: JSON.stringify({data: [requestID, decision, staffID, othersDecision, dateTime]}),
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data === "VALID") {
                alert("You have approved the request.");
                window.location.reload();
            }
        })
    }

    // Rejects the current request.
    function RejectRequest(requestID) {
        const currentDate = new Date();
        let dateTime = {
            day: currentDate.getDate(),
            month: currentDate.getMonth() + 1,
            year: currentDate.getFullYear(),
            hour: currentDate.getHours(),
            minutes: currentDate.getMinutes()
        }
        let decision = "Reject";
        let othersDecision = "Otherwise Decided";
        fetch("/api/change-request-status", {
            method: 'POST',
            body: JSON.stringify({data: [requestID, decision, staffID, othersDecision, dateTime]}),
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data === "VALID") {
                alert("You have rejected the request.");
                window.location.reload();
            }
        })
    }

    // Selects contact for the current request.
    function ContactStudent(requestID) {
        const currentDate = new Date();
        let dateTime = {
            day: currentDate.getDate(),
            month: currentDate.getMonth() + 1,
            year: currentDate.getFullYear(),
            hour: currentDate.getHours(),
            minutes: currentDate.getMinutes()
        }
        let decision = "Contact";
        let othersDecision = "Otherwise Decided";
        fetch("/api/change-request-status", {
            method: 'POST',
            body: JSON.stringify({data: [requestID, decision, staffID, othersDecision, dateTime]}),
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data === "VALID") {
                fetch("/api/get-student-email", {
                    method: 'POST',
                    body: JSON.stringify({data: [requestID]}),
                    headers: {
                        'Content-Type': 'application/json '
                    }
                })
                .then(response => response.json())
                .then(data => {
                    console.log(data);
                    // Displays the email of the student.
                    alert("You have requested to contact the student, their email is " + data[0].email + ".");
                    window.location.reload(); 
                })
            }
            
        })
    }

    // Forwards the request on to other staff in the module.
    function ForwardRequest(requestID, module) {
        fetch("/api/forward-request-decision", {
            method: 'POST',
            body: JSON.stringify({data: [requestID, staffID, module]}),
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data === "VALID") {
                alert("You have forwaded the request onto the other staff.")
               window.location.reload(); 
            }
            
        })
    }

    // Displays each pending request.
    function DisplayReuqests() {
        let rows = [];
        if (allRequest.length < 1) {
            rows.push(<h2>There are no requests currenlty pending.</h2>);
        }
        for (let request of allRequest) {
            rows.push(<p>Module: {request.moduleCode}</p>);
            let dateTime = JSON.parse(request.answers).dateTime;
            rows.push(<p>Made on {dateTime.day}/{dateTime.month}/{dateTime.year} at {dateTime.hour}:{dateTime.minutes}</p>);
            rows.push(<br></br>)
            let requestQuestions = JSON.parse(request.answers).questions;
            let requestAnswers = JSON.parse(request.answers).answers;
            let questionTable = [];
            questionTable.push(
                <tr>
                    <th>Question</th>
                    <th>Answer</th>
                </tr>
            )
            for (let i = 0; i <requestQuestions.length; i++) {
                if (typeof requestAnswers[i] === "object") {
                    const answerString = requestAnswers[i].join(' | ');
                    questionTable.push(
                        <tr key={i}>
                            <td>{requestQuestions[i]}</td>
                            <td>{answerString}</td>
                        </tr>
                    )                }
                else {
                    questionTable.push(
                        <tr key={i}>
                            <td>{requestQuestions[i]}</td>
                            <td>{requestAnswers[i]}</td>
                        </tr>
                    )
                }
            }
            rows.push(
                <table>
                    {questionTable}
                </table>
            )
            rows.push(<br></br>)
            if (JSON.parse(request.answers).initialReviewer === staffID) {
                rows.push(
                    <div>
                        <button type="button" id="button" onClick={() => ApproveRequest(request.requestID)}>Approve</button>
                        <button type="button" id="button" onClick={() => ContactStudent(request.requestID)}>Contact</button> 
                        <button type="button" id="button" onClick={() => RejectRequest(request.requestID)}>Reject</button>
                        <button type="button" id="button" onClick={() => ForwardRequest(request.requestID, request.moduleCode)}>Forward</button>
                    </div>
                )
            }
            else {
                rows.push(
                    <div>
                        <button type="button" id="button" onClick={() => ApproveRequest(request.requestID)}>Approve</button>
                        <button type="button" id="button" onClick={() => ContactStudent(request.requestID)}>Contact</button> 
                        <button type="button" id="button" onClick={() => RejectRequest(request.requestID)}>Reject</button>
                    </div>
                )
            }
        }
        return rows;
    }
    // The HTML.
    return <div className="staff-decision-page">
        <div>
            <h1>Pending Requests In Your Modules</h1>
            <DisplayReuqests/>
        </div>
    </div>
}
