const helmet = require("helmet");
const config = require("config");
const debug = require("debug")("app:startup");
const morgan = require("morgan");
const Joi = require("joi");
const logger = require("./logger");
const auth = require("./auth");
const express = require("express");
const res = require("express/lib/response");
const app = express();
//middleware1
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(helmet());

//configuration
console.log("Application name:" + config.get("name"));
console.log("Mail Server:" + config.get("mail.host"));
console.log("Mail Password:" + config.get("mail.password"));

if (app.get("env") === "development") {
  app.use(morgan("tiny")); // only logs in dev environment(export NODE_ENV=development)
  // console.log("morgan enabled...");
  debug('Morgan enabled')
}

app.use(logger);
app.use(auth);

const courses = [
  { id: 1, name: "course1" },
  { id: 2, name: "course2" },
  { id: 3, name: "course3" },
];

app.get("/", (req, res) => {
  res.send("Hello world!");
});

app.get("/api/courses", (req, res) => {
  res.send(courses);
});

app.post("/api/courses", (req, res) => {
  const { error } = validateCourse(req.body);
  if (error) {
    //400- bad request
    return res.status(400).send(error.details[0].message);
  }

  const course = {
    id: courses.length + 1,
    name: req.body.name,
  };
  courses.push(course);
  res.send(course);
});

app.put("/api/courses/:id", (req, res) => {
  //Lookup the course for the existence 404
  const course = courses.find((c) => c.id === parseInt(req.params.id));
  if (!course)
    return res.status(404).send("The course with the given id was not found");

  //validate (invalid =400)
  const { error } = validateCourse(req.body);
  if (error) {
    //400- bad request
    return res.status(400).send(error.details[0].message);
  }
  //update course
  course.name = req.body.name;
  //return updated course
  res.send(course);
});

app.delete("/api/courses/:id", (req, res) => {
  //Lookup the course
  //Not exist - return 404
  const course = courses.find((c) => c.id === parseInt(req.params.id));
  if (!course)
    return res.status(404).send("The course with the given id was not found");
  //Delete
  const index = courses.indexOf(course);
  courses.splice(index, 1);

  //Return same course
  res.send(course);
});

function validateCourse(course) {
  const schema = {
    name: Joi.string().min(3).required(),
  };
  return Joi.validate(course, schema);
}

app.get("/api/courses/:id", (req, res) => {
  const course = courses.find((c) => c.id === parseInt(req.params.id));
  if (!course)
    return res.status(404).send("The course with the given id was not found");
  res.send(course);
});

//PORT
//export PORT = 4000 in the terminal
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Listening at port ${PORT}...`);
});
