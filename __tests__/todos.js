/* eslint-disable no-undef */
const request = require("supertest");
var cheerio = require("cheerio");
const db = require("../models/index");
const app = require("../app");

let server, agent;
function extractCsrfToken(res) {
  var $ = cheerio.load(res.text);
  return $("[name=_csrf]").val();
}
const login = async (agent, username, password) => {
  let res = await agent.get("/");
  let csrfToken = extractCsrfToken(res);
  res = await agent.post("/LoginDetail").send({
    email: username,
    password: password,
    _csrf: csrfToken,
  });
};

describe("Todo test suite ", () => {
  beforeAll(async () => {
    await db.sequelize.sync({ force: true });
    server = app.listen(3005, () => {});
    agent = request.agent(server);
  });
  afterAll(async () => {
    await db.sequelize.close();
    server.close();
  });

  test("Signup", async () => {
    let res = await agent.get("/Signup");
    const csrfToken = extractCsrfToken(res);
    res = await agent.post("/userdetail").send({
      FirstName:"Javid",
      LastName:"Sumara",
      email:"javidsumara987@gmail.com",
      password:"12345678",
      _csrf: csrfToken,
    });
    expect(res.statusCode).toBe(302);
  });

  test("Sign out", async () => {
    let res = await agent.get("/todoPage");
    expect(res.statusCode).toBe(200);
    res = await agent.get("/signout");
    expect(res.statusCode).toBe(302);
    res = await agent.get("/todoPage");
    expect(res.statusCode).toBe(302);
  });

  test("Login", async () => {
    const agent = request.agent(server);
    await login(agent, "javidsumara987@gmail.com", "12345678");
    const res = await agent.get("/todoPage");
    const csrfToken = extractCsrfToken(res);
    response = await agent.post("/todos").send({
      title: "buy milk",
      dueDate: new Date().toISOString(),
      completed: false,
      _csrf: csrfToken,
    });
    expect(response.statusCode).toBe(302); 
  });

  test("Deleting todo test", async () => {
    const agent = request.agent(server);
    await login(agent, "javidsumara987@gmail.com", "12345678");
    let res = await agent.get("/todoPage");
    let csrfToken = extractCsrfToken(res);

    await agent.post("/todos").send({
      title: "Buy milk",
      dueDate: new Date().toISOString(),
      completed: false,
      _csrf: csrfToken,
    });

    const groupedTodosResponse = await agent
      .get("/todoPage")
      .set("Accept", "application/json");
    const parsedGroupedTodosResponse = JSON.parse(groupedTodosResponse.text);
    const dueTodayCount = parsedGroupedTodosResponse.today.length;
    const newTodo = parsedGroupedTodosResponse.today[dueTodayCount - 1];

    res = await agent.get("/todoPage");
    csrfToken = extractCsrfToken(res);

    const deleteTodo = await agent
      .delete(`/todos/${newTodo.id}`)
      .send({ _csrf: csrfToken });

      const status = Boolean(deleteTodo.text)
      expect(status).toBe(true);
  });
  test("mark todo as incomplete", async () => {
    const agent = request.agent(server);
    await login(agent, "javidsumara987@gmail.com", "12345678");
    let res = await agent.get("/todoPage");
    let csrfToken = extractCsrfToken(res);
    await agent.post("/todos").send({
      title: "buy milk",
      dueDate: new Date().toISOString(),
      completed: true,
      _csrf: csrfToken,
    });
    const groupedTodosResponse = await agent
      .get("/todoPage")
      .set("Accept", "application/json");

    const parsedGroupedResponse = JSON.parse(groupedTodosResponse.text);
    const dueTodayCount = parsedGroupedResponse.today.length;
    const newTodo = parsedGroupedResponse.today[dueTodayCount - 1];

    res = await agent.get("/todoPage");
    csrfToken = extractCsrfToken(res);

    const markCompleteResponse = await agent.put(`/todos/${newTodo.id}/markAsCompleted`).send({
      completed: false,
      _csrf: csrfToken,
    });
    const parsedUpdateResponse = JSON.parse(markCompleteResponse.text);
    expect(parsedUpdateResponse.completed).toBe(false);
  });
});