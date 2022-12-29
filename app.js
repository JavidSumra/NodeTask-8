/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
const express = require("express");
const app = express();
const csrf = require("tiny-csrf")
const cookiepasrser=require("cookie-parser")
const { Todo } = require("./models");
const bodyParser = require("body-parser");
const path = require("path");
const ejs = require("ejs");
const todo = require("./models/todo");


app.use(bodyParser.json());
app.set('view engine','ejs');
const pathofview = path.join(__dirname+"/views");
app.set("views",pathofview);

app.use(express.urlencoded({extended:false}));
app.use(cookiepasrser("this is Secret String"))
app.use(csrf("this_should_be_32_character_long",["POST","PUT","DELETE"]));


app.get("/",async function (request, response) {
   const todolist = await Todo.gettodos();
   const yesterday = await Todo.Overdue();
   const tomorrow = await Todo.duelater();
   const today = await Todo.duetoday();
   const completedtodos = await Todo.completetodo();
   
   
  if(request.accepts("html")){
    response.status(400).render("index",{
    todolist,yesterday,tomorrow,today,completedtodos,csrfToken:request.csrfToken(),
  })
    }
  else{
    response.json({
      todolist,
      yesterday,
      tomorrow,
      today
    })
  }
});

// app.get("/todo", async function (request, response) {
//   console.log("Processing list of all Todos ...");
//   try {
//     const todo = await Todo.findAll({order:[["id","ASC"]]});
//     return  response.json(todo)
//   } catch (error) {
//     return response.status(400).json(error)
//   }
// });

app.post("/todos", async function (request, response) {
  try {
    let todotitle = request.body.title;
    let completiondate = request.body.dueDate ?? new Date().toISOString();

    
    const todos = await Todo.addTodo({title:todotitle.trim(),dueDate:completiondate,completed:false});
   return response.status(400).redirect("/");
  } catch (error) {
    console.log(error);
    return response.status(400).json(error);
  }
});

app.put("/todos/:id/markAsCompleted", async function (request, response) {
  const todoupdate = await Todo.findByPk(request.params.id);
  try {
    const updatedTodolist = await todoupdate.setCompletionStatus(request.body.completed);
    return response.json(updatedTodolist);
  } catch (error) {
    console.log(error);
    return response.status(400).json(error);
  }
});

app.delete("/todos/:id", async function (request, response) {
  console.log("We have to delete a Todo with ID: ", request.params.id);
  const deleteItem = await Todo.destroy({where:{id:request.params.id}})
  response.send(deleteItem?true:false)
});

module.exports = app;
