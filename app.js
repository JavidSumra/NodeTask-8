/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
const express = require("express");
const app = express();
const csrf = require("tiny-csrf");
const cookiepasrser = require("cookie-parser");
const Todo = require("./models/todo");
const UserDetail = require("./models/userdetail");
const bodyParser = require("body-parser");
const path = require("path");
const ejs = require("ejs");
const flash = require("connect-flash");

const passport = require("passport");
const connectEnsureLogin = require("connect-ensure-login");
const session = require("express-session");
const LocalStrategy = require("passport-local");

app.use(bodyParser.json());

const bcrypt = require("bcrypt");

const saltround = 10;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookiepasrser("this is Secret String"));
app.use(csrf("this_should_be_32_character_long", ["POST", "PUT", "DELETE"]));

app.use(
  session({
    secret: "my-super-secret-key-2021095900025026",
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new LocalStrategy(
    {
      usenameField: "email",
      passwordField: "password",
    },
    (username, password, done) => {
      UserDetail.findOne({
        where: {
          email: username,
        },
      })
        .then(async function (user) {
          if (user) {
            const resultantPass = await bcrypt.compare(password, user.password);
            if (resultantPass) {
              return done(null, user);
            } else {
              return done(null, false, { message: "Invalid Password" });
            }
          } else {
            return done(null, false, { message: "User Does Not Exist" });
          }
        })
        .catch((error) => {
          console.log(error);
          return error;
        });
    }
  )
);

passport.serializeUser((user, done) => {
  console.log("Serealizing User in Session", user.id);
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  UserDetail.findByPk(id)
    .then((user) => {
      done(null, user);
    })
    .catch((err) => {
      done(err, null);
    });
});

app.set("view engine", "ejs");
const pathofview = path.join(__dirname + "/views");
app.set("views", pathofview);
app.use(flash());

app.use(function (request, response, next) {
  response.locals.messages = request.flash();
  next();
});

app.get("/", async (request, response) => {
  // console.log(await UserDetail.findAll({}))
  response.status(200).render("Login", { csrfToken: request.csrfToken() });
});
app.get("/Signup", (request, response) => {
  response.status(200).render("SignUp", { csrfToken: request.csrfToken() });
});

app.get(
  "/todoPage",
  connectEnsureLogin.ensureLoggedIn(),
  async (request, response) => {
    const UserId = request.user.id;

    const yesterday = await Todo.Overdue(UserId);
    const tomorrow = await Todo.duelater(UserId);
    const today = await Todo.duetoday(UserId);
    const completedtodos = await Todo.completetodo(UserId);

    if (request.accepts("html")) {
      response.status(200).render("index", {
        yesterday,
        tomorrow,
        today,
        completedtodos,
        Name: request.user.FirstName,
        csrfToken: request.csrfToken(),
      });
    } else {
      response.json({
        yesterday,
        tomorrow,
        today,
      });
    }
  }
);

app.get("/signout", (request, response, next) => {
  request.logout((err) => {
    if (err) {
      return next(err);
    }
    response.redirect("/");
  });
});
app.post("/userdetail", async (request, response) => {
  try {
    const hashPass = await bcrypt.hash(request.body.password, saltround);

    const add = await UserDetail.create({
      email: request.body.email,
      FirstName: request.body.fname,
      LastName: request.body.lname,
      password: hashPass,
    });
    console.log(request.body.email);
    console.log(hashPass);
    console.log(request.body.fname);
    console.log(request.body.lname);
    console.log(await bcrypt.compare(request.body.password, hashPass));
    request.login(add, (err) => {
      if (err) {
        console.log(err);
      }
      response.redirect("/todoPage");
    });
  } catch (error) {
    console.log(error);
  }
});

app.post(
  "/LoginDetail",
  passport.authenticate("local", { failureRedirect: "/", failureFlash: true }),
  (request, response) => {
    console.log(request.body);
    response.redirect("/todoPage");
  }
);
app.post(
  "/todos",
  connectEnsureLogin.ensureLoggedIn(),
  async (request, response) => {
    try {
      let todotitle = request.body.title;
      let completiondate = request.body.dueDate ?? new Date().toISOString();

      const todos = await Todo.create({
        title: todotitle.trim(),
        dueDate: completiondate,
        completed: false,
        userId: request.user.id,
      });
      return response.status(400).redirect("/todoPage");
    } catch (error) {
      console.log(error);
      return response.status(400).json(error);
    }
  }
);

app.put(
  "/todos/:id/markAsCompleted",
  connectEnsureLogin.ensureLoggedIn(),
  async function (request, response) {
    const todoupdate = await Todo.findByPk(request.params.id);
    try {
      const updatedTodolist = await todoupdate.setCompletionStatus(
        request.body.completed
      );
      // console.log(updatedTodolist?true:false)
      response.status(201).send(updatedTodolist ? true : false);
    } catch (error) {
      console.log(error);
      return response.status(400).json(error);
    }
  }
);

app.delete(
  "/todos/:id",
  connectEnsureLogin.ensureLoggedIn(),
  async function (request, response) {
    console.log("We have to delete a Todo with ID: ", request.params.id);
    const deleteItem = await Todo.DestroyTodo(
      request.params.id,
      request.user.id
    );
    response.send(deleteItem ? true : false);
  }
);

module.exports = app;
