const express = require("express");
const app = express();
const PORT = 8080;


function generateRandomString() {

}

//Set ejs as the view engine

//Getting Ready for POST Requests <-- This needs to come before all of our routes
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

// We need to define the route that will match this POST
app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  res.send("Ok");         // Respond with 'Ok' (we will replace this)
});

// Add a GET Route to Show the Form

app.set("view engine", "ejs");

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

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
  if( !urlDatabase[req.params.shortURL]){ // if a client requests a non-existent shortURL
    let templateVars = {
      status: 404,
      message: ' 404  non-existent URL',
      user: users[req.session.user_id]
    }
    res.status(404)
    res.render('urls_error', templateVars)
  }

  app.post("/urls", (req, res) =>{ // What happens to the urlDatabase when the server is restarted
    let templateVars = { 
      status: 401,
      message: ' must authenticate to get the requested response.',
      user: users[req.session.user_id]
    }
  })

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

//Redirect Short URLs

app.get("/u/:shortURL", (req, res) => {
  
  const longURL = urlDatabase[req.params.shortURL];
  console.log(req.params.shortURL);  // ... Complete the code so that requests to the endpoint "/u/:shortURL" will redirect to its longURL

  res.redirect(longURL);
});
