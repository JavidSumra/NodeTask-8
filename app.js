/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
const express = require("express");
const app = express();
const csrf = require("tiny-csrf");
const cookiepasrser = require("cookie-parser");
<<<<<<< HEAD
const { Todo, User } = require("./models");
=======
const { Todo, User } = require("./models")
>>>>>>> 9a2e8d135357aa45d441ac3ac3f212b32e238270
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
<<<<<<< HEAD
const { type } = require("os");

const saltround = 10;

=======

const saltround = 10;


>>>>>>> 9a2e8d135357aa45d441ac3ac3f212b32e238270
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
<<<<<<< HEAD
  connectEnsureLogin.ensureLoggedIn({ redirectTo: "/" }),
=======
  connectEnsureLogin.ensureLoggedIn({redirectTo:"/"}),
>>>>>>> 9a2e8d135357aa45d441ac3ac3f212b32e238270
  async (request, response) => {
    const UserId = request.user.id;

    const yesterday = await Todo.Overdue(UserId);
    const tomorrow = await Todo.duelater(UserId);
    const today = await Todo.duetoday(UserId);
    const completedtodos = await Todo.completetodo(UserId);

    if (request.accepts("html")) {
      response.render("index", {
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
<<<<<<< HEAD
    request.flash("success", "Signout Successfully");
=======
    request.flash("success","Signout Successfully")
>>>>>>> 9a2e8d135357aa45d441ac3ac3f212b32e238270
    response.redirect("/");
  });
});
app.post("/userdetail", async (request, response) => {
  try {
<<<<<<< HEAD
    const findUser = await User.findAll({
      where: { email: request.body.email },
    });
    if (findUser.length != 0) {
      request.flash("error", "Email Already Exist");
      return response.redirect("/Signup");
    } else {
      const hashPass = await bcrypt.hash(request.body.password, saltround);

      const add = await User.create({
        FirstName: request.body.fname,
        LastName: request.body.lname,
        email: request.body.email,
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
        return response.redirect("/todoPage");
      });
    }
  } catch (error) {
    console.log(error);
    response.send("Error:" + error);
=======
    const findUser = await User.findAll({where:{email:request.body.email}})
    if (findUser.length != 0) {
      request.flash("error","Email Already Exist")
      return response.redirect("/Signup")
    }    
    else {
      const hashPass = await bcrypt.hash(request.body.password, saltround);

    const add = await User.create({
      FirstName: request.body.fname,
      LastName: request.body.lname,
      email: request.body.email,
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
     return response.redirect("/todoPage");
    });
    }
  } catch (error) {
    console.log(error);
>>>>>>> 9a2e8d135357aa45d441ac3ac3f212b32e238270
  }
});

app.post(
  "/LoginDetail",
  passport.authenticate("local", { failureRedirect: "/", failureFlash: true }),
  (request, response) => {
    // console.log(request.body);
<<<<<<< HEAD
    request.flash("success", "Login Successfully");
=======
    request.flash("success","Login Successfully")
>>>>>>> 9a2e8d135357aa45d441ac3ac3f212b32e238270
    response.redirect("/todoPage");
  }
);
app.post(
  "/todos",
<<<<<<< HEAD
  connectEnsureLogin.ensureLoggedIn({ redirectTo: "/" }),
=======
  connectEnsureLogin.ensureLoggedIn({redirectTo:"/"}),
>>>>>>> 9a2e8d135357aa45d441ac3ac3f212b32e238270
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
<<<<<<< HEAD
      request.flash("success", "Added Successfully");
      return response.redirect("/todoPage");
    } catch (error) {
      return response.status(422).json(error);
=======
      request.flash("success","Added Successfully");
      return response.redirect("/todoPage");
    } catch (error) {
     return response.status(422).json(error)
>>>>>>> 9a2e8d135357aa45d441ac3ac3f212b32e238270
    }
  }
);

app.put(
  "/todos/:id/markAsCompleted",
<<<<<<< HEAD
  connectEnsureLogin.ensureLoggedIn({ redirectTo: "/" }),
=======
  connectEnsureLogin.ensureLoggedIn({redirectTo:"/"}),
>>>>>>> 9a2e8d135357aa45d441ac3ac3f212b32e238270
  async function (request, response) {
    const todoupdate = await Todo.findByPk(request.params.id);
    try {
      const updatedTodolist = await todoupdate.setCompletionStatus(
        request.body.completed
      );
<<<<<<< HEAD
      if (updatedTodolist ? true : false) {
        request.flash("success", "Successfully Updated");
      } else {
        request.flash("error", "Failed Update");
      }
      return response.json(updatedTodolist);
=======
      if(updatedTodolist?true:false){
        request.flash("success","Successfully Updated")
      }
      else{
        request.flash("error","Failed Update")
      }
      return response.json(updatedTodolist)
>>>>>>> 9a2e8d135357aa45d441ac3ac3f212b32e238270
    } catch (error) {
      console.log(error);
      return response.status(400).json(error);
    }
  }
);

app.delete(
  "/todos/:id",
<<<<<<< HEAD
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
=======
  connectEnsureLogin.ensureLoggedIn({redirectTo:"/"}),
  async function (request, response) {
    console.log("We have to delete a Todo with ID: ", request.params.id+" "+request.user.id);
    let deleteItem = await Todo.DestroyTodo(request.params.id,request.user.id);
    if(deleteItem?true:false){
      request.flash("success","Successfully Deleted")
    }
    else{
      request.flash("error","Failed Deleted")
    }
    return response.send(deleteItem?true:false);
>>>>>>> 9a2e8d135357aa45d441ac3ac3f212b32e238270
  }
);

module.exports = app;
