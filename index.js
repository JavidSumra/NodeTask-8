/* eslint-disable no-undef */
const app = require("./app");
const listenport = process.env.PORT || 3005;

app.listen(listenport, () => {
  console.log(`Started express server at port ${listenport}`);
});
