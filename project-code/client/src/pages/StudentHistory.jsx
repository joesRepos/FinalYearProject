import React, {useEffect, useState} from 'react';
import { useNavigate } from "react-router-dom";
import { useLocation } from 'react-router-dom';

// The Student History/ Request History page.
export default function StudentHistory() {
    const navigate = useNavigate();
    const [studentID, setStudentID] = useState([]);
    const [requestData, setRequestData] = useState([]);
    const [loginType, setLoginType] = useState([]);
    
    // Upon loading, fetches all the data from the backend and the session storage.
    useEffect(() => {
        setLoginType(sessionStorage.getItem("LoginType"));
        if (sessionStorage.getItem("LoginType") === "Staff" && window.location.href.substring(window.location.href.lastIndexOf('/') + 1) !== "student-history-page") {
            setStudentID(window.location.href.substring(window.location.href.lastIndexOf('/') + 1));
        }
        else {
            setStudentID(sessionStorage.getItem("studentID"));
        }
        // Gets all the previously made requests by the student.
        fetch("/api/get-student-history", {
            method: "POST",
            body: JSON.stringify({data: sessionStorage.getItem("studentID")}),
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            setRequestData(data);
        })
        .catch(error => console.error(error))
    }, []);

    // Displays the requests one after the other.
    function DisplayRequests() {
        let rows = [];
        if (requestData.length < 1) {
            rows.push(<h2>There are no requests to display.</h2>);
        }
        for (let request of requestData) {
            rows.push(<p>Module: {request.moduleCode}</p>)
            let dateTime = JSON.parse(request.answers).dateTime;
            rows.push(<p>Made on {dateTime.day}/{dateTime.month}/{dateTime.year} at {dateTime.hour}:{dateTime.minutes}</p>)
            let requestQuestions = JSON.parse(request.answers).questions;
            let requestAnswers = JSON.parse(request.answers).answers;
            rows.push(<br></br>);
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
            rows.push(<br></br>);
            rows.push(<p>Status: {request.status}</p>)
            rows.push(<br></br>);
        }
        return rows;
    }

    // Displays the analysis of the frequency of requests only to staff.
    function DisplayAnalysis() {
        if (loginType === "Student" && requestData.length < 1) {
            return;
        }
        let rows = [];
        rows.push(<h2>{requestData.length} request(s) made in total.</h2>);
        let total = 0;
        for (let request of requestData) {
            let dateTime = JSON.parse(request.answers).dateTime;
            let constructedDate = new Date(dateTime.year + "-" + dateTime.month + "-" + dateTime.day);
            const currentDate = new Date();
            const timeDifference = currentDate - constructedDate;
            const daysDifference = timeDifference / (1000 * 60 * 60 * 24);

            if (daysDifference <= 30) {
                total++;
            }
        }
        rows.push(<h2>{total} request(s) made in the past month (30 days).</h2>);
        rows.push(<br></br>);
        return rows;
    }

    // The HTML.
    return <div className = "student-history-page">
        <div>
            <h1>Request history for {studentID}</h1>
            <DisplayAnalysis/>
            <DisplayRequests/>
        </div>
        
        
    </div>
}

