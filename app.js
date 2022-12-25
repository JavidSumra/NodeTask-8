/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
const express = require("express");
const app = express();
const { Todo } = require("./models");
const bodyParser = require("body-parser");
const path = require("path");
const ejs = require("ejs");


app.use(bodyParser.json());
app.set('view engine','ejs');
const pathofview = path.join(__dirname+"/views");

app.set("views",pathofview);

app.get("/",async function (request, response) {

  await Todo.addTodo({title:"Go on Trip",dueDate:"2022-4-30"});
   await Todo.addTodo({title:"Complete Capstone Project",dueDate:"2023-1-9"});
   const todolist = await Todo.gettodos();
   const yesterday = await Todo.Overdue();
   const tomorrow = await Todo.duelater();
   const today = await Todo.duetoday();
   
   try {
    response.render("index",{
      todolist,yesterday,tomorrow,today,
    });
   } catch (error) {
    response.send(error)
   }
});

app.get("/todos", async function (request, response) {
  console.log("Processing list of all Todos ...");
  try {
    const todo = await Todo.findAll({order:[["id","ASC"]]});
    return  response.json(todo)
  } catch (error) {
    return response.status(400).json(error)
  }
});

app.post("/todos", async function (request, response) {
  try {
    const todos = await Todo.addTodo({
      title:request.body.title,
      dueDate:request.body.dueDate,
      completed:false
    });
    await todos.save();
    response.redirect("/");
  } catch (error) {
    console.log(error);
    return response.status(400).json(error);
  }
});

app.put("/todos/:id/markAsCompleted", async function (request, response) {
  const todo = await Todo.findByPk(request.params.id);
  try {
    const updatedTodolist = await todo.markAsCompleted();
    response.redirect("/");
  } catch (error) {
    console.log(error);
    return response.status(400).json(error);
  }
});

app.delete("/todos/:id", async function (request, response) {
  console.log("We have to delete a Todo with ID: ", request.params.id);
  const deleteItem = await Todo.destroy({where:{id:request.params.id}})
  console.log(deleteItem?true:false)
  response.render("index")
});

module.exports = app;
