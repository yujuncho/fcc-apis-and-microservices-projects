const app = require("./app");
const PORT = process.env.PORT || process.env.NODE_ENV === 'test' ? 3002 : 3001;

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
