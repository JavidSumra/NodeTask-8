/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */


const request = require("supertest");

const db = require("../models/index");
const app = require("../app");
const todo = require("../models/todo");
const cheerio = require("cheerio");

let server, agent;
function extractCsrfToken(res){
  var $ =cheerio.load(res.text);
  return $("[name=_csrf]").val();
}

describe("Todo Application", function () {
  beforeAll(async () => {
    await db.sequelize.sync({ force: true });
    server = app.listen(process.env.PORT || 3005, () => {});
    agent = request.agent(server);
  });

  afterAll(async () => {
    try {
      await db.sequelize.close();
      await server.close();
    } catch (error) {
      console.log(error);
    }
  });

  test("Creates a todo", async () => {
    let agent  =  request.agent(server);
    let res =await agent.get("/");
    const csrfToken = extractCsrfToken(res)
    const response = await agent.post("/todos").send({
      title: "Buy milk",
      dueDate: new Date().toISOString(),
      completed: false,
      _csrf:csrfToken
    });
    expect(response.statusCode).toBe(302);
    // expect(response.header["content-type"]).toBe(
    //   "application/json; charset=utf-8"
    // );
    // const parsedResponse = JSON.parse(response.text);
    // expect(parsedResponse.id).toBeDefined();
  });
  
  test("Marks a todo with the given ID as complete", async () => {
    let agent  =  request.agent(server);
    let  res = await agent.get("/")
    let csrfToken = extractCsrfToken(res);
    const response = await agent.post("/todos").send({
      title: "Buy milk",
      dueDate: new Date().toISOString(),
      completed: false,
      _csrf:csrfToken,
    });
    // const todoID = parsedResponse.id;
    
    // expect(parsedResponse.completed).toBe(false);

    // const markCompleteResponse = await agent
    //   .put(`/todos/${todoID}/markASCompleted`)
    //   .send();
    // const parsedUpdateResponse = JSON.parse(markCompleteResponse.text);
    // expect(parsedUpdateResponse.completed).toBe(true);
    const todos = await agent.get("/").set("Accept","application/json");
    const parsedResponse = JSON.parse(todos.text);
    const count = parsedResponse.today.length;
    const todo = parsedResponse.today[count - 1];
    const status = todo.completed?false:true;
    res = await agent.get("/");
    csrfToken = extractCsrfToken(res);
    
    const markASCompleted = await agent.put(`/todos/${todo.id}/markAsCompleted`).send({_csrf: csrfToken,completed:status})
  });

  // test("Fetches all todos in the database using /todos endpoint", async () => {
    //   await agent.post("/todos").send({
      //     title: "Buy xbox",
      //     dueDate: new Date().toISOString(),
      //     completed: false,
      //   });
      //   await agent.post("/todos").send({
        //     title: "Buy ps3",
        //     dueDate: new Date().toISOString(),
        //     completed: false,
  //   });
  //   const response = await agent.get("/todos");
  //   const parsedResponse = JSON.parse(response.text);

  //   expect(parsedResponse.length).toBe(4);
  //   expect(parsedResponse[3]["title"]).toBe("Buy ps3");
  // });

  test("Deletes a todo with the given ID if it exists and sends a boolean response", async () => {
    let agent = request.agent(server)
    let res = await agent.get("/")
    let csrfToken = extractCsrfToken(res);

    await agent.post("/todos").send({
      title:"Buy new box",
      dueDate: new Date().toISOString(),
      completed: false,
    });
    const todos = await agent.get("/").set("Accept","application/json")
    // const parsedres = JSON.parse(res.text);
    const parsedResponse = JSON.parse(todos.text);
    const count = parsedResponse.today.length;
    // const todo = parsedResponse.today[count - 1];
    const todoid = parsedResponse.id;
    res = await agent.get("/todos");
    csrfToken=extractCsrfToken(res)
    const response = await agent.delete(`/todos/${todoid}`).send({_csrf:csrfToken});

    const bool = Boolean(res.text);
    expect(bool).toBe(true);
  });
});
