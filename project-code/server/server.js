const express = require('express');
const app = express();
app.use(express.json());
const mysql = require("mysql");

// Creates a connection with the database.
const con = mysql.createConnection({
    host: "jm455.teaching.cs.st-andrews.ac.uk",
    user: "jm455",
    password: "bmGqiSU5CZs!V6",
    database: "jm455_CS4099DB"
  });
  con.connect(function (err) {
    if (err) {
      console.log('Error connecting to database');
      return;
    }
    console.log('Database connection established');
  });

// Request for checking if login details aexist in the database.
app.post("/api/check-login-detail", (req, res) => {
    const data = req.body.data;
    let username = data[0];
    let loginType = data[1];
    // Split for the staff and student database.
    if (loginType === "Student") {
        let accessed = false;
        con.query('SELECT studentID FROM Student',
        function (err, rows) {
            if (err) {
                throw err;
            }
            else {
                for (let i = 0; i < rows.length; i++) {
                    if (rows[i].studentID === username) {
                        accessed = true;
                        res.json("VALID");
                    }
                }
                if (!accessed) {
                    res.json("INVALID");
                }
            }

        });
    }
    else if (loginType === "Staff") {
        let accessed = false;
        con.query('SELECT staffID FROM Staff',
        function (err, rows) {
            if (err) {
                throw err;
            }
            else {
                for (let i = 0; i < rows.length; i++) {
                    if (rows[i].staffID === username) {
                        accessed = true;
                        res.json("VALID");
                    }
                }
                if (!accessed) {
                    res.json("INVALID");
                } 
            }
        });
    }
});

// Request for getting the name of a user based on their username.
app.post("/api/get-name", (req, res) => {
    const data = req.body.data;
    let username = data[0];
    let loginType = data[1];
    if (loginType === "Student") {
        con.query('SELECT name FROM Student WHERE studentID = ?',
        [username], function (err, rows) {
            if (err) {
                // res.send("DATABASE ERROR");
                throw err;
            }
            else {
                res.json(rows[0].name);
            }
            
        })
    }
    else if (loginType === "Staff") {
        con.query('SELECT name FROM Staff WHERE staffID = ?',
        [username], function (err, rows) {
            if (err) {
                // res.json("DATABASE ERROR");
                throw err;
            }
            else {
                res.json(rows[0].name);
            }
            
        }) 
    }
});

// Request for getting all the module a student gets with a specific username.
app.post("/api/get-student-modules", (req, res) => {
    const data = req.body.data;
    let username = data[0];
    let loginType = data[1];
    if (loginType === "Student") {
        con.query('SELECT Module.moduleCode FROM Module JOIN takes ON Module.moduleCode = takes.moduleCode WHERE takes.studentID = ?;',
        [username], function (err, rows) {
            if (err) {
                res.json("DATABASE ERROR");
                throw err;
            }
            else {
               res.json(rows); 
            }
            
        })
    }
    else if (loginType === "Staff") {
        con.query('SELECT name FROM Staff WHERE email = ?;',
        [username], function (err, rows) {
            if (err) {
                res.json("DATABASE ERROR");
                throw err;
            }
            else {
                res.json(rows[0].name);
            }
            
        })
    }
});

// Request for getting the data of a module for editing.
app.post("/api/get-edit-module-data", (req, res) => {
    const moduleCode = req.body.data;
    con.query("SELECT school, name, requestData, initialReviewer FROM Module WHERE moduleCode = ?;",
    [moduleCode], function (err, rows) {
        if (err) {
            throw err;
        }
        else {
            if (rows.length === 0) {
                res.json("EMPTY");
            }
            else {
                res.json(rows[0]);
            }
            
        }
    })
})

// Request for getting the email of a student.
app.post("/api/get-student-email", (req, res) => {
    let requestID = req.body.data;
    con.query("SELECT Student.email FROM ExtensionRequest JOIN Student ON ExtensionRequest.studentID = Student.studentID WHERE ExtensionRequest.requestID = ?;",
    [requestID], function (err, rows) {
        if (err) {
            throw err;
        }
        else {
            res.json(rows);
        }
    })
})

// Request for getting the list of modules a staff has access to.
app.post("/api/get-staff-review-modules", (req, res) => {
    const data = req.body.data;
    let username = data[0];
    let loginType = data[1];
    if (loginType === "Staff") {
        con.query('SELECT Module.moduleCode FROM Module JOIN reviews ON Module.moduleCode = reviews.moduleCode WHERE reviews.staffID = ?;',
        [username], function (err, rows) {
            if (err) {
                res.json("DATABASE ERROR");
                throw err;
            }
            else {
               res.json(rows); 
            }
            
        })
    }
});

// Request for checking if the module exists already or not.
app.post("/api/module-not-exist", (req, res) => {
    const data = req.body.data;
    con.query("SELECT EXISTS (SELECT 1 FROM Module WHERE moduleCode = ?) AS moduleExists;", 
    [data], function (err, rows) {
        if (err) {
            res.json("DATABASE ERROR");
            throw err;
        }
        else if (rows[0].moduleExists === 0) {
            res.json("VALID");
        }
        else {
          res.json("INVALID");  
        }
        
    })
})

// Request for getting all staff IDs.
app.get("/api/get-all-staff",  (req, res) => {
    con.query("SELECT staffID FROM Staff;", 
    function (err, rows) {
        if (err) {
            res.json("DATABASE ERROR");
            throw err;
        }
        else {
            res.json(rows);
        }
        
    })
})

// Request for getting all module codes.
app.get("/api/get-all-modules",  (req, res) => {
    con.query("SELECT moduleCode FROM Module;", 
    function (err, rows) {
        if (err) {
            res.json("DATABASE ERROR");
            throw err;
        }
        else {
            res.json(rows);
        }
        
    })
})

// Request for getting module questions based on a module code.
app.post("/api/get-module-questions", (req, res) => {
    const module = req.body.data;

    con.query("SELECT requestData FROM Module WHERE moduleCode = ?;",
    [module], function(err, rows) {
        if (err) {
            res.json("DATABASE ERROR");
            throw err;
        }
        else {
           res.json(rows); 
        }
        
    })
});

// Request for creating a new form for a module.
app.post("/api/create-new-module", (req, res) => {
    const data = req.body.data;
    let code = data.code;
    let title = data.title;
    let school = data.school;
    let reviewersArray = data.reviewers;
    let questions = data.questions;
    let firstReviewer = data.firstReviewer;
    let questionsInput = JSON.stringify(questions);
    con.query("INSERT INTO Module (moduleCode, name, school, requestData, initialReviewer) VALUES (?, ?, ?, ?, ?);",
    [code, title, school, questionsInput, firstReviewer], function(err) {
        if (err) {
            throw err;
        }
        else {
            for (let reviewer of reviewersArray) {
                con.query("INSERT INTO reviews (staffID, moduleCode) VALUES (?, ?);",
                [reviewer, code], function(err) {
                    if (err) {
                        // res.json("DATABASE ERROR");
                        throw err;
                    }
                    else {
                        res.json("VALID");
                    }
                })
            }
            
        }
    });
});

// Request for updating the data for a module form.
app.post("/api/update-module", (req, res) => {
    const data = req.body.data;
    let code = data.code;
    let title = data.title;
    let school = data.school;
    let reviewersArray = data.reviewers;
    let questions = data.questions;
    let firstReviewer = data.firstReviewer;
    let questionsInput = JSON.stringify(questions);
    con.query("UPDATE Module SET name = ?, school = ?, requestData = ?, initialReviewer = ? WHERE moduleCode = ?;",
    [title, school, questionsInput, firstReviewer, code], function(err) {
        if (err) {
            res.json("DATABASE ERROR");
            throw err;
        }
        else {
            con.query("DELETE FROM reviews WHERE moduleCode = ?;",
            [code], function (err) {
                if (err) {
                    throw err;
                }
                else {
                    for (let reviewer of reviewersArray) {
                        con.query("INSERT INTO reviews (staffID, moduleCode) VALUES (?, ?);",
                        [reviewer, code], function(err) {
                            if (err) {
                                console.log(err);
                                throw err;
                            }
                        })
                    }
                    res.json("VALID");
                }
            })

        }
    });
});

// Request for getting the data about a module based on a module code.
app.post("/api/get-module-data", (req, res) => {
    let moduleCode = req.body.data;
    con.query("SELECT * FROM Module WHERE moduleCode = ?;",
    [moduleCode], function(err, rows) {
        if (err) {
            throw err;
        }
        res.json(rows);
        return;
    })
});

// Request for creating a new request.
app.post("/api/create-new-request", (req, res) => {
    const data = req.body.data;
    let student = data[0];
    let module = data[1];
    let answerJSON = JSON.stringify(data[2]);
    con.query("SELECT COUNT(*)  AS total FROM ExtensionRequest;", 
    function(err, rows) {
        if (err) {
            res.json("DATABASE ERROR");
        }
        let requestID = rows[0].total + 1;
        let initialReviewer = JSON.parse(answerJSON).initialReviewer;
        con.query("INSERT INTO ExtensionRequest (requestID, studentID, moduleCode, answers) VALUES (?, ?, ?, ?);",
        [requestID, student, module, answerJSON], function (err, rows) {
            if (err) {
                throw err;
            }
            else {
                if (initialReviewer !== null) {
                    con.query("INSERT INTO Decision (requestID, staffID, status) VALUES (?, ?, ?);", 
                    [requestID, initialReviewer, "Pending"], function (err, rows) {
                        if (err) {
                            throw err;
                        }
                        else {
                        res.json("VALID"); 
                        }
                    
                    })
                }
                else {
                    con.query("SELECT staffID FROM reviews WHERE moduleCode = ?;",
                    [module], function (err, rows) {
                        if (err) {
                            res.json("DATABASE ERROR");
                            throw err;
                        }
                        else {
                            for (let staff of rows) {
                                con.query("INSERT INTO Decision (requestID, staffID, status) VALUES (?, ?, ?);",
                                [requestID, staff, "Pending"], function (err, rows) {
                                    if (err) {
                                        res.json("DATABASE ERROR");
                                        throw err;
                                    }
                                    else {
                                        res.json("VALID");
                                    }
                            
                                })
                            }
                        }
                    })
                }
            }
        })
    })
});

// Request for getting all data for a student based on their ID.
app.post("/api/get-student-history", (req, res) => {
    let studentID = req.body.data;
    con.query("SELECT * FROM ExtensionRequest WHERE studentID = ?;",
    [studentID], function (err, rows) {
    if (err) {
        throw err;
    }
    else {
        res.json(rows);
    }
    
    })
});

// Request for getting all decisions made by a staff member based on their ID.
app.post("/api/get-staff-history", (req, res) => {
    let staffID = req.body.data;
    con.query("SELECT ExtensionRequest.studentID, ExtensionRequest.moduleCode, ExtensionRequest.answers, Decision.status, Decision.madeOn" + 
     " FROM Decision JOIN ExtensionRequest ON Decision.requestID = ExtensionRequest.requestID WHERE Decision.staffID = ?;",
     [staffID], function (err, rows) {
        if (err) {
            throw err;
        }
        else {
            res.json(rows);
        }
        
     })
});

// Request for getting all requests that a staff member can review that are pending.
app.post("/api/get-pending-staff-decisions", (req, res) => {
    let staffID = req.body.data;
    con.query("SELECT ExtensionRequest.requestID, ExtensionRequest.studentID, ExtensionRequest.moduleCode, ExtensionRequest.answers FROM ExtensionRequest JOIN Decision ON ExtensionRequest.requestID = Decision.requestID WHERE Decision.status = 'Pending' AND Decision.staffID = ?;",
    [staffID], function (err, rows) {
        if (err) {
            res.json("DATABASE ERROR");
            throw err;
        }
        else {
            res.json(rows);
        }
        
    })
})

// Request for changing the current status of a request.
app.post("/api/change-request-status", (req, res) => {
    const data = req.body.data;
    let requestID = data[0];
    let decision = data[1];
    let staffID = data[2];
    let otherDecision = data[3];
    let madeOn = JSON.stringify(data[4]);
    con.query("UPDATE ExtensionRequest SET status = ? WHERE requestID = ?;",
    [decision, requestID], function (err) {
        if (err) {
            throw err;
        }
        else {
            con.query("UPDATE Decision SET status = ?, madeOn = ? WHERE requestID = ? AND staffID = ?;",
            [decision, madeOn, requestID, staffID], function (err) {
                if (err) {
                    throw err;
                }
                else {
                    con.query("UPDATE Decision SET status = ? WHERE requestID = ? AND staffID != ?;",
                    [otherDecision, requestID, staffID], function (err) {
                        if (err) {
                            throw err;
                        }
                        else {
                            res.json("VALID");
                        }
                    })
                }
            })
        }

    })
})

// Request for sending a request on to the other staff on the module.
app.post("/api/forward-request-decision", (req, res) => {
    const data = req.body.data;
    let requestID = data[0];
    let staffID = data[1];
    let module = data[2];
    con.query("UPDATE Decision SET status = 'forwarded' WHERE requestID = ? AND StaffID = ?;",
    [requestID, staffID], function (err) {
        if (err) {
            throw err;
        }
        else {
            con.query("SELECT staffID FROM reviews WHERE moduleCode = ? AND staffID != ?;",
            [module, staffID], function (err, rows) {
                for (let row of rows) {
                    con.query("INSERT INTO Decision (requestID, staffID, status) VALUES (?, ?, 'Pending');",
                    [requestID, row.staffID], function (err) {
                        if (err) {
                            throw err;
                        }
                        else {
                            res.json("VALID");
                        }
                    })
                }
            })
        }
    })
})

app.listen(22602, () => {console.log("Server started on port 22602")});