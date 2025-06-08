import React, {useEffect, useState} from 'react';
import { useNavigate } from "react-router-dom";
import { useLocation } from 'react-router-dom';
//import './style.css';


// The Create New Form page/ Edit Form page.
export default function CreateNewModulePage() {
    const navigate = useNavigate();
    const [newModuleCode, setNewModuleCode] = useState([]);
    const [editForm, setEditForm] = useState([]);
    const [allStaff, setAllStaff] = useState([]);
    const [allModules, setAllModules] = useState([]);
    const [allQuestions, setAllQuestions] = useState([]);
    const [creating, setCreating] = useState([]);
    const [currentType, setCurrentType] = useState([]);
    const [currentID, setCurrentID] = useState([]);
    const [currentOptions, setCurrentOptions] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState([]);
    const [currentHelp, setCurrentHelp] = useState([]);
    const [currentRequired, setCurrentRequired] = useState([]);

    // Upon loading, fetches all the data from the session storage and backend.
    useEffect(() => {
        setEditForm(sessionStorage.getItem("EditForm"));      
        if (sessionStorage.getItem("EditForm")) {
            fetch("/api/get-edit-module-data", {
                method: 'POST',
                body: JSON.stringify({data: [sessionStorage.getItem("NewModuleCode")]}),
                headers: {
                    'Content-Type': 'application/json'
                  }
            })
            .then(response => response.json())
            .then(data => {
                 if (data === "EMPTY") {
                    sessionStorage.setItem("EditForm", false);
                 }
                 else {
                    document.getElementById("newModuleTitle").value = data.name;
                    document.getElementById("newModuleSchool").value = data.school;
                    setAllQuestions(JSON.parse(data.requestData));
                    setCurrentID(JSON.parse(data.requestData).length);
                 }
                
            })
        }


        setCurrentID(0);
        setNewModuleCode(sessionStorage.getItem("NewModuleCode"));      
        setCreating(false);
        // Gets all staff sotred in the database.
        fetch("/api/get-all-staff", {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            setAllStaff(data);
        })

        // Gets all module titles stored in the database.
        fetch("/api/get-all-modules", {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            setAllModules(data);
        })

    }, []);

    // The selector for what staff are on the module.
    function StaffSelection() {
        let rows =[];
        for (let staff of allStaff) {
            rows.push(
                <option value={staff.staffID}>{staff.staffID}</option>
            )
        }
        return rows;
    }

    // Displays all the already made questions.
    function DisplayQuestionConstrcutor() {
        let rows = [];

        if (!creating) {
            rows.push(<p>Add Question: </p>);
            rows.push(<select id="newQuestion" name="newQuestion">
            <option value="multiChoice">Multiple choice</option>
            <option value="multiChoiceVarious">Multiple selection</option>
            <option value="textBox">Text box</option>
            </select>);
            rows.push(<button type="button" id="button" onClick={StartQuestion}>Start</button>);
            return rows;
        }
        else if (currentType === "textBox") {
            rows.push(<p>Enter the question: </p>);
            rows.push(<input type="text" id ="question" placeholder="QUESTION" required/>);
            rows.push(<p>Enter an explanation of the question (optional): </p>);
            rows.push(<input type="text" id ="questionHelp" placeholder="HELP" required/>);
            rows.push(<p>Question Required: </p>);
            rows.push(
                <select id="required" name="required">
                    <option value="YES">Yes</option>
                    <option value="NO">No</option>
                </select>
            )
            rows.push(<br></br>);
            rows.push(<button type="button" id="button" onClick={addTextBoxQuestion}>Add Question</button>);
            return rows;
        }
        else if (currentType === "multiChoice" || currentType === "multiChoiceVarious") {
            if (currentQuestion.length === 0) {
                rows.push(<p>Enter the question: </p>);
                rows.push(<input type="text" id ="question" placeholder="QUESTION" required/>);
                rows.push(<p>Enter an explanation of the question (optional): </p>);
                rows.push(<input type="text" id ="questionHelp" placeholder="HELP" required/>);
                rows.push(<p>Question Required: </p>);
                rows.push(
                    <select id="required" name="required">
                        <option value="YES">Yes</option>
                        <option value="NO">No</option>
                    </select>
                )
                rows.push(<br></br>);
                rows.push(<button type="button" id="button" onClick={SetQuestion}>Set Question</button>);
            }
            else {
                rows.push(
                    <div>
                        <p>{currentQuestion}</p>
                        <p>{currentHelp}</p>
                        <p>Required: {currentRequired}</p>
                        <DisplayQuestionOptions/>
                        <input type="text" id ="questionOption" placeholder="OPTION" required/>
                        <button type="button" id="button" onClick={AddOption}>Add</button>
                        <br></br>
                        <button type="button" id="button" onClick={AddSelectionQuestion}>Finish</button>
                    </div>
                )
            }
           

            return rows;
        }
    }

    // Adds a selection question to the list of questions.
    function AddSelectionQuestion() {
        if (currentOptions.length < 2) {
            alert("A multiple choice question must have at least two options.")
        }
        else {
            let data = {
                id: currentID,
                type: currentType,
                question: currentQuestion,
                options: currentOptions,
                required: currentRequired
            }
            setAllQuestions(prevArray => [...prevArray, data]);
            setCreating(false);
            setCurrentID(currentID + 1);
            setCurrentOptions("");
            setCurrentQuestion("");
        }

    }

    // Sets the question.
    function SetQuestion() {
        let question = document.getElementById("question").value;
        let newHelp = document.getElementById("questionHelp").value;
        let required = document.getElementById("required").value;
        if (question === "") {
            alert("The question is blank.");
            return;
        }
        setCurrentQuestion(question);
        setCurrentHelp(newHelp);
        setCurrentRequired(required);
    }

    function AddOption() {
        let newOption = document.getElementById("questionOption").value;
        if (newOption === "") {
            alert("The option is empty.");
        }
        else {
           setCurrentOptions(prevArray => [...prevArray, newOption]); 
        }
        
    }

    // Displays the list of question options.
    function DisplayQuestionOptions() {
        let rows = [];
        for (let option of currentOptions) {
            rows.push(
            <div>
                {option}
                <button type="button" id="button" onClick={() => DeleteOption(option)}>DELETE</button>
            </div>);
        }
        rows.push(<br></br>);
        return rows;
    }

    // Adds a text box question to the list of questions.
    function addTextBoxQuestion() {
        let newQuestion = document.getElementById("question").value;
        let newHelp = document.getElementById("questionHelp").value;
        let required = document.getElementById("required").value;
        if (newQuestion === "") {
            alert("The question is missing.");
            return;
        }
        let data = {
                    id: currentID,
                    type: 'textBox',
                    question: newQuestion,
                    help: newHelp,
                    required: required
                }
        setAllQuestions(prevArray => [...prevArray, data]);
        setCreating(false);
        setCurrentID(currentID + 1);
    }

    // Deletes a question.
    function DeleteOption(toDelete) {
        setCurrentOptions(currentOptions.filter(item => item !== toDelete));
    }

    // Displays all questions.
    function DisplayQuestions() {
        if (allQuestions.length === 0 || allQuestions === null) {
            return;
        }
        let rows = [];
        for (let currentQuestion of allQuestions) {
            if (currentQuestion.type === "textBox") {
                rows.push(<p>Text Box Question</p>);
                rows.push(<p>Question: {currentQuestion.question}</p>);
                rows.push(<button type="button" id="button" onClick={() => RemoveQuestion(currentQuestion.id)}>DELETE</button>);
                rows.push(<button type="button" id="button" onClick={() => MoveQuestion(currentQuestion.id, -1)}>DOWN</button>)
                rows.push(<button type="button" id="button" onClick={() => MoveQuestion(currentQuestion.id, 1)}>UP</button>);
            }
            else if (currentQuestion.type === "multiChoice" || currentQuestion.type === "multiChoiceVarious") {
                rows.push(
                <div>
                    <p>Text Box Question</p>
                    <p>Question: {currentQuestion.question}</p>
                    <p>Options: {currentQuestion.options.join(' | ')}</p>
                    <button type="button" id="button" onClick={() => RemoveQuestion(currentQuestion.id)}>DELETE</button>
                    <button type="button" id="button" onClick={() => MoveQuestion(currentQuestion.id, -1)}>DOWN</button>
                    <button type="button" id="button" onClick={() => MoveQuestion(currentQuestion.id, 1)}>UP</button>
                </div>
                )

            }
        }
        return rows;
    }

    // Creates the selector for a module to import.
    function ModuleSelection() {
        let rows = [];
        rows.push(<option value="">Select</option>);
        for (let module of allModules) {
            rows.push(<option value={module.moduleCode}>{module.moduleCode}</option>);
        }

        return rows;
    }

    // Removes a question from the questions array.
    function RemoveQuestion(deleteID) {
        let deleted = false;
        let deleteIndex = 0;
        for (let i = 0; i < allQuestions.length; i++) {
            if (deleted) {
                allQuestions[i].id = i - 1;
            }
            if (allQuestions[i].id == deleteID && !deleted) {
                deleteIndex = i;
                deleted = true;
            }
        }
        let newQuestions = [];
        for (let i = 0; i < allQuestions.length; i++) {
            if (i !== deleteIndex) {
                newQuestions.push(allQuestions[i]);
            }
        }
        setAllQuestions(newQuestions);
    }

    // Moves a question in the order.
    function MoveQuestion(id, move) {
        let replacement = allQuestions[0];
        let placeholder = Array.from(allQuestions);
        for (let i = 0; i < allQuestions.length; i++) {
            if ((move > 0 && allQuestions[i].id === id && i != 0) || (move < 0 && allQuestions[i].id === id && i != allQuestions.length - 1)) {
                replacement = placeholder[i - move];
                placeholder[i - move] = placeholder[i];
                placeholder[i] = replacement;
            }
        }
        setAllQuestions(placeholder);
    }

    // Starts a new question.
    function StartQuestion() {
        let questionType = document.getElementById("newQuestion").value;
        setCurrentType(questionType);
        setCreating(true);
    }

    // Imports questions from a different module.
    function ImportQuestions() {
        let moduleSelected = document.getElementById("importModule").value;

        fetch("/api/get-module-questions", {
            method: 'POST',
            body: JSON.stringify({data: [moduleSelected]}),
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (JSON.parse(data[0].requestData) !== null) {
                setAllQuestions(JSON.parse(data[0].requestData));
            }
        })
    }

    // Attempts to create a new form.
    function CreateForm() {
        let reveiwers = document.getElementById("reviewers");
        let moduleName = document.getElementById("newModuleTitle").value;
        let school = document.getElementById("newModuleSchool").value;
        let firstReviewer = document.getElementById("firstStaff").value;
        let reviewersArray = [];
        if (moduleName === "") {
            alert("The module title is blank.");
            return;
        }
        else if (school === "") {
            alert("The school name is blank.")
        }
        for (let option of reveiwers.options) {
            if (option.selected) {
                reviewersArray.push(option.value);
            }
        }

        let moduleData = {
            code: newModuleCode,
            title: moduleName,
            school: school,
            reviewers: reviewersArray,
            firstReviewer: firstReviewer,
            questions: allQuestions
        };

        if (editForm === "true") {
           fetch("/api/update-module", {
            method: 'POST',
            body: JSON.stringify({data: moduleData}),
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(response => response.json())
            .then(data => {
                if (data === "VALID") {
                    sessionStorage.setItem("EditForm", false);

                    navigate("/staff-home-page");
                }
            });
        }
        else {
            fetch("/api/create-new-module", {
                method: 'POST',
                body: JSON.stringify({data: moduleData}),
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(data => {
            if (data === "VALID") {
                navigate("/staff-home-page");
            }
            })
        }
    }

    // Displays the header type, depending on if it is create or edit.
    function DisplayPageHeader() {
        if (editForm === "true") {
            return <h1>Editing form for {newModuleCode}</h1>;
        }
        else {
            return <h1>Creating new form for {newModuleCode}</h1>;
        }
    }

    // The HTML.
    return <div className="new-module-page">
        <div>
            <DisplayPageHeader/>
            <p>Module Title: </p>
            <input type="text" id ="newModuleTitle" placeholder="NAME" required/>
            <p>School: </p>
            <input type="text" id ="newModuleSchool" placeholder="SCHOOL" required/>
            <br></br>
            <p>Import questions from another module:</p>
            <select id="importModule" name="importModule">
                <ModuleSelection/>
            </select>
            <button type="button" id="button" onClick={ImportQuestions}>Import</button>
            <br></br>

            <DisplayQuestions/>
            <DisplayQuestionConstrcutor/>
            <br></br>
            <p>Select all staff that will recieve the request.</p>
            <select id="reviewers" name="reviewers" size="2" multiple>
                <StaffSelection/>
            </select>
            <br></br>
            <p>Select staff the review should reach first (optional).</p>
            <select id="firstStaff" name="firstStaff">
                <option value="">Select</option>
                <StaffSelection/>
            </select>
            <br></br>
            <button type="button" id="button" onClick={CreateForm}>Submit</button>
        </div>
    </div>;
}