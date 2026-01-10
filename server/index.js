const express = require('express');
const app = express();
const dotenv= require('dotenv');
dotenv.config({ path: ".env.dev" });

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on http://localhost:${process.env.PORT}`);
});