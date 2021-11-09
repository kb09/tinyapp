const express = require("express");
const app = express();
const PORT = 8080;

//Set ejs as the view engine

app.set("view engine", "ejs");

//Adding Routes

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//Sending HTML

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// short URL

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]  /* What goes here? */ };
  res.render("urls_show", templateVars);
});

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


