import { useNavigate } from "react-router-dom";
import React, {useEffect, useState} from 'react';

// The Decision History page.
export default function LoginPage() {
    const navigate = useNavigate();
    const [username, setUsername] = useState([]);
    const [allDecisions, setAllDecisions] = useState([]);
    // Upon loading gets all the data from the session and backend.
    useEffect(() => {
        setUsername(sessionStorage.getItem("Username"));
        fetch("/api/get-staff-history", {
            method: 'POST',
            body: JSON.stringify({data: [sessionStorage.getItem("Username")]}),
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
            .then(data => {
                setAllDecisions(data);
            })
    }, []);

    // Displays each decision. 
    function DisplayDecisions() {
        let rows = [];
        if (allDecisions.length < 1) {
            rows.push(<h2>There are no decisions to display.</h2>);
        }
        for (let decision of allDecisions) {
            rows.push(
                <div>
                    <p>Module Code: {decision.moduleCode}</p>
                    <p>Student: {decision.studentID}</p>
                </div>
            )
            if (decision.madeOn !== null) {
                let dateTime = JSON.parse(decision.madeOn);
               rows.push(<p>Decision made on {dateTime.day}/{dateTime.month}/{dateTime.year} at {dateTime.hour}:{dateTime.minutes}</p>);
            }
            
            let requestQuestions = JSON.parse(decision.answers).questions;
            let requestAnswers = JSON.parse(decision.answers).answers;
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
                    )
                }
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
            rows.push(<p>Decision: {decision.status}</p>);
            rows.push(<br></br>);
        }
        return rows;
    }

    // The HTML.
    return <div className="decision-history-page">
        <div>
            <h1>Decision History of {username}</h1>
            <DisplayDecisions/>
        </div>
    </div>
}