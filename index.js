var express = require('express');
var app = express();
//var bodyParser = require('body-parser');
//app.use(bodyParser.urlencoded({extended: true}));

var courses = {};
var students = {};

app.get("/students", function(req, res){
    res.send({students: students})
});

app.post("/courses", function(req, res){
    var courseKey = req.query.key;
    var courseLimit = req.query.limit;
    courses[courseKey] = {limit: courseLimit,
                          enrolled: [],
                          waitlist: []};
    res.send();
});

app.post("/students", function(req, res){
    var studentID = req.query.id;
    var courseLimit = req.query.limit;
    if (students[studentID]) {
        res.status(409).send({ error: "This student ID already exists." });
    } else {
        students[studentID] = {limit: courseLimit,
                                enrolled: [],
                                waitlist: []};
        res.send();
    }   
});

app.post("/students/:student_id/enroll", function(req, res){
    var studentID = req.params.student_id;
    var courseKey = req.query.course_key;
    if (!courses[courseKey]) {
        res.status(400).send({error: "This course does not exist."});
    } else if (!students[studentID]) {
        res.status(400).send({error: "This student ID does not exist."});
    } else {
        var course = courses[courseKey]["enrolled"];
        var courseLimit = courses[courseKey]["limit"];
        var courseWaitlist = courses[courseKey]["waitlist"];
        var studentLimit = students[studentID]["limit"];
        var studentEnrolled = students[studentID]["enrolled"];
        var studentWaitlist = students[studentID]["waitlist"];
        if (course.length < courseLimit && studentEnrolled.length < studentLimit) {
            course.push(studentID);
            studentEnrolled.push(courseKey);
            console.log(course);
            console.log(studentEnrolled);
            res.send();
        } else if (course.length >= courseLimit && studentEnrolled.length < studentLimit) {
            courseWaitlist.push(studentID);
            studentWaitlist.push(courseKey);
            res.send({ success: "This course is full, but you have been added to the waitlist."});
        } else if (studentEnrolled.length >= studentLimit) {
            res.status(400).send({ error: "You have exceed your course limit."});
        }
    }  
});

app.post("/students/:student_id/drop", function(req, res){
    var studentID = req.params.student_id;
    var courseKey = req.query.course_key;
    if (!courses[courseKey]) {
        res.status(400).send({error: "This course does not exist."});
    } else if (!students[studentID]) {
        res.status(400).send({error: "This student ID does not exist."});
    } else {
        var course = courses[courseKey]["enrolled"];
        var courseWaitlist = courses[courseKey]["waitlist"];
        var studentLimit = students[studentID]["limit"];
        var studentEnrolled = students[studentID]["enrolled"];
        var studentWaitlist = students[studentID]["waitlist"];
        for (var i in course) {
            if(studentID !== course[i]){
                res.status(400).send({error: "You are not enrolled in this course."});
            } else {
                course.splice(i, 1);
                studentEnrolled.splice(i, 1);
                //waitlisted student
                var studentID = courseWaitlist[0];
                studentEnrolled = students[studentID]["enrolled"];
                studentLimit = students[studentID]["limit"];
                studentWaitlist = students[studentID]["waitlist"];
                if(studentID && studentEnrolled.length < studentLimit) {
                    course.push(studentID);
                    studentEnrolled.push(courseKey);
                    courseWaitlist.shift();
                    //assuming the student is only waitlisted in one class
                    studentWaitlist.pop()
                    res.send()
                } else if (studentEnrolled.length >= studentLimit) {
                    res.status(400).send({ error: "Student not enrolled; has exceed course limit."});
                    //ideally then I would check if there were other students on the waitlist to add instead
                } else {
                    //the course was dropped successfully but there isn't a student on the waitlist to enroll
                    res.send()
                }
            };
        }        
    }  
});

app.listen(3000, function () {
  console.log('Course app listening on port 3000!')
});