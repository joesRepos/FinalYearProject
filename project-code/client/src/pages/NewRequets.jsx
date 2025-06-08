import React, {useEffect, useState} from 'react';
import { useLocation } from 'react-router-dom';
import { useNavigate } from "react-router-dom";

// The New Request pag.
export default function NewRequest() {
    const navigate = useNavigate();
    const [name, setName] = useState([]);
    const [moduleTitle, setModuleTtile] = useState([]);
    const [school, setSchool] = useState([]);
    const [questionData, setQuestionData] = useState([]);
    const [username, setUsername] = useState([]);
    const [module, setModule] = useState([]);
    const [initialReviewer, setInitialReveiwer] = useState([]);

    // Upon loading, fetches the data from the session and backend.
    useEffect(() => {
        setUsername(sessionStorage.getItem("Username"));
        setModule(sessionStorage.getItem("module"));

        // Gets the nameof the student.
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
        .catch(error => console.error(error));

        // Gets all the data for the module request form.
        fetch("/api/get-module-data", {
            method: 'POST',
            body: JSON.stringify({data: sessionStorage.getItem("module")}),
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            setModuleTtile(data[0].name);
            setSchool(data[0].school);
            setQuestionData(JSON.parse(data[0].requestData));
            setInitialReveiwer(data[0].initialReviewer);
        })
    }, []);

    // Generates all the questions from the module data.
    function GenerateQuestions() {
        let rows = [];
        console.log(questionData);
        for (let question of questionData) {
            if (question.type === "textBox") {
                rows.push(<p>{question.question}</p>);
                if (question.help !== null) {
                    rows.push(<p>{question.help}</p>);
                }
                rows.push(<input type="text" id ={question.id} placeholder="Answer" required/>);
            }
            else if (question.type === "multiChoice") {
                rows.push(<p>{question.question}</p>);
                if (question.help !== null) {
                    rows.push(<p>{question.help}</p>);
                }
                rows.push(
                    <select id={question.id} name={question.id}>
                <option value="">Select</option>
                <DisplayOptions options={question.options} />
                </select>
                );
            }
            else if (question.type === "multiChoiceVarious") {
                rows.push(<p>{question.question}</p>);
                if (question.help !== null) {
                    rows.push(<p>{question.help}</p>);
                }
                rows.push(
                    <select id={question.id} name={question.id} size="2" multiple>
                <DisplayOptions options={question.options} />
                </select>
                );
            }
        }
        return rows;
    }

    // Displays the options of a multiple choice question.
    function DisplayOptions(options) {
        let rows = [];
        for (let option of options.options) {
            rows.push(<option value={option}>{option}</option>);
        }
        return rows;
    }

    // Attempts to submit the form.
    function SubmitForm() {
        let answers = [];
        let questions = [];
        // Validation checks.
        for (let question of questionData){
            if (question.required === "YES" && document.getElementById(question.id).value === "") {
                alert(question.question + " requires an answer.");
                return;
            }
            if (question.type === "multiChoiceVarious") {
                let responses = [];
                for (let entry of document.getElementById(question.id)) {
                    responses.push(entry.value);
                }
                questions.push(question.question);
                answers.push(responses);
            }
            else {
                questions.push(question.question);
                answers.push(document.getElementById(question.id).value);
            }
        }
        var currentDate = new Date();
        let dateTime = {
            day: currentDate.getDate(),
            month: currentDate.getMonth() + 1,
            year: currentDate.getFullYear(),
            hour: currentDate.getHours(),
            minutes: currentDate.getMinutes()
        }
        let questioAnswerData = {
            questions: questions,
            answers: answers,
            initialReviewer: initialReviewer,
            dateTime: dateTime
        };
        let userID = username;
        // Creates the request.
        fetch("api/create-new-request", {
            method: 'POST',
            body: JSON.stringify({data: [userID, module, questioAnswerData, initialReviewer]}),
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data === "VALID") {
                sessionStorage.setItem("studentID", username);
                navigate("/student-history-page");
            }
        });
    }

    // The HTML.
    return <div className="student-home-page">
        <div>
            <h1>Creating New Extension Request For {module}: {moduleTitle}</h1>
            <h2>In the school of {school}</h2>
            <GenerateQuestions/>
            <div></div>
            <button type="button" id="button" onClick={SubmitForm}>Submit Request</button>
        </div>
    </div>;
}