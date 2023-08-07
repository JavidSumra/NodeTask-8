/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
const express = require("express");
const app = express();
const csrf = require("tiny-csrf");
const cookiepasrser = require("cookie-parser");
const { Todo, User } = require("./models");
// const { Todo, User } = require("./models")
const bodyParser = require("body-parser");
const path = require("path");
const ejs = require("ejs");
const flash = require("connect-flash");

// Cron Job and Node Mailer

const cron = require("node-cron");
const mail = require("./nodemailer");

const passport = require("passport");
const connectEnsureLogin = require("connect-ensure-login");
const session = require("express-session");
const LocalStrategy = require("passport-local");

app.use(bodyParser.json());

const bcrypt = require("bcrypt");

const saltround = 10;

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
      usernameField: "email",
      passwordField: "password",
    },
    (username, password, done) => {
      User.findOne({
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
  User.findByPk(id)
    .then((user) => {
      done(null, user);
    })
    .catch((err) => {
      done(err, null);
    });
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookiepasrser("this is Secret String"));
app.use(csrf("this_should_be_32_character_long", ["POST", "PUT", "DELETE"]));

app.set("view engine", "ejs");
const pathofview = path.join(__dirname + "/views");
app.set("views", pathofview);
app.use(flash());

app.use(function (request, response, next) {
  const Message = request.flash();
  response.locals.messages = Message;
  next();
});

app.get("/", async (request, response) => {
  // console.log(await UserDetail.findAll({}))
  response.render("Login", { csrfToken: request.csrfToken() });
});
app.get("/Signup", (request, response) => {
  response.render("SignUp", { csrfToken: request.csrfToken() });
});

app.get(
  "/todoPage",
  connectEnsureLogin.ensureLoggedIn({ redirectTo: "/" }),
  async (request, response) => {
    const UserId = request.user.id;
    // console.log(global.env.email);
    const yesterday = await Todo.Overdue(UserId);
    const tomorrow = await Todo.duelater(UserId);
    const today = await Todo.duetoday(UserId);
    const completedtodos = await Todo.completetodo(UserId);
    console.log(today);
    if (request.accepts("html")) {
      response.status(202).render("index", {
        yesterday,
        tomorrow,
        today,
        completedtodos,
        Name: request.user.FirstName,
        csrfToken: request.csrfToken(),
      });
    } else {
      response.status(202).json({
        yesterday,
        tomorrow,
        today,
        completedtodos,
      });
    }
  }
);

app.get("/signout", (request, response, next) => {
  request.logout((err) => {
    if (err) {
      return next(err);
    }
    request.flash("success", "Signout Successfully");

    response.redirect("/");
  });
});
app.post("/userdetail", async (request, response) => {
  try {
    const findUser = await User.findAll({
      where: { email: request.body.email },
    });
    if (findUser.length != 0) {
      request.flash("error", "Email Already Exist");
      return response.redirect("/Signup");
    } else {
      const hashPass = await bcrypt.hash(request.body.password, saltround);
      const add = await User.create({
        FirstName: request.body.FirstName,
        LastName: request.body.LastName,
        email: request.body.email,
        password: hashPass,
      });
      console.log(add);
      request.login(add, (err) => {
        if (err) {
          console.log(err);
        }
        return response.redirect("/todoPage");
      });
    }
  } catch (error) {
    console.log(error);
    response.send("Error:" + error);
  }
});

app.post(
  "/LoginDetail",
  passport.authenticate("local", { failureRedirect: "/", failureFlash: true }),
  (request, response) => {
    // console.log(request.body);
    request.flash("success", "Login Successfully");

    response.redirect("/todoPage");
  }
);
app.post(
  "/todos",
  connectEnsureLogin.ensureLoggedIn({ redirectTo: "/" }),
  async (request, response) => {
    try {
      let todotitle = request.body.title;
      let completiondate = request.body.dueDate ?? new Date().toISOString();
      // console.log(completiondate);

      const todos = await Todo.create({
        title: todotitle.trim(),
        dueDate: completiondate,
        completed: false,
        userId: request.user.id,
      });

      request.flash("success", "Added Successfully");
      return response.redirect("/todoPage");
    } catch (error) {
      return response.status(422).json(error);
    }
  }
);

app.put(
  "/todos/:id/markAsCompleted",

  connectEnsureLogin.ensureLoggedIn({ redirectTo: "/" }),

  async function (request, response) {
    const todoupdate = await Todo.findByPk(request.params.id);
    try {
      const updatedTodolist = await todoupdate.setCompletionStatus(
        request.body.completed
      );

      if (updatedTodolist ? true : false) {
        request.flash("success", "Successfully Updated");
      } else {
        request.flash("error", "Failed Update");
      }
      return response.json(updatedTodolist);
    } catch (error) {
      console.log(error);
      return response.status(400).json(error);
    }
  }
);

app.delete(
  "/todos/:id",

  connectEnsureLogin.ensureLoggedIn({ redirectTo: "/" }),
  async function (request, response) {
    console.log(
      "We have to delete a Todo with ID: ",
      request.params.id + " " + request.user.id
    );
    let deleteItem = await Todo.DestroyTodo(request.params.id, request.user.id);
    if (deleteItem ? true : false) {
      request.flash("success", "Successfully Deleted");
    } else {
      request.flash("error", "Failed Deleted");
    }
    return response.send(deleteItem ? true : false);
  }
);

const remindTodos = async () => {
  let today = new Date().toISOString().split("T")[0];
  let incompleteTodos = await Todo.inCompletedTodos(today);

  let usersId = [];

  incompleteTodos.map(async (todo) => {
    usersId.push(todo.userId);
  });
  usersId = [...new Set(usersId)];

  usersId.map(async (id) => {
    let userIncomplete = await Todo.incompleteTodosByUser(today, id);
    let { FirstName, email } = await User.findByPk(id);
    // console.log(email);
    let todosList = userIncomplete.map((todo, index) => {
      return `(${index + 1}) ${todo.title}\n`;
    });

    mail(
      email,
      "Friendly Reminder: Pending To-Do's Update",
      `Dear ${FirstName},
  
      I hope this email finds you well. As a gentle reminder, our server has detected a few pending to-do items associated with your account. We encourage you to take a moment to review and complete these tasks for smoother workflow and better organization.
      
      Here's a quick summary of your pending to-do's:
      
      ${todosList.join("")}
  
      Please log in to your account and access the 'To-Do' section to view the detailed list and associated deadlines. Our team is always available to assist you with any questions or clarifications you may have regarding these tasks.
      
      Taking prompt action on these pending to-do's will not only help you stay on top of your responsibilities but also contribute to the overall efficiency of our operations.
      
      If you have already completed any of these tasks, kindly ignore this email. We appreciate your attention to this matter and thank you for using our platform to manage your tasks.
  
      Thank you for your cooperation.
      Best regards,
      Todo App`
    );
  });
};
cron.schedule(
  "25 19 * * *",
  function () {
    remindTodos();
  },
  {
    timezone: "Asia/Calcutta",
  }
);
module.exports = app;
