const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const users = {  //global object called users which is used to store and access users
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

const generateRandomString = function () {
  return Math.random().toString(36).substr(2, 6);
};

//Getting Ready for POST Requests <-- This needs to come before all of our routes

app.use(bodyParser.urlencoded({extended: true})); 
app.use(cookieParser());//Add an endpoint to handle a POST to /login 



//Set ejs as the view engine

app.set("view engine", "ejs" );

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//Adding Routes
app.get("/urls", (req, res) => {
  console.log(req.headers);
  let templateVars = {
    urls: urlDatabase,
    username:req.cookies["username"] //Add an endpoint to handle a POST to login 
  }
  res.render("urls_index", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let longURL = urlDatabase[shortURL];
  const templateVars = {shortURL: shortURL, 
    longURL: longURL,
     username: req.cookies["username"]};
  res.render("urls_show", templateVars);

  if( !urlDatabase[req.params.shortURL]){ // if a client requests a non-existent shortURL
        let templateVars = {
          status: 404,
          message: ' 404  non-existent URL',
          user: users[req.session.user_id],
          username: req.cookies["username"]
        }
      }
        res.status(404)
        res.render('urls_error', templateVars)
    
      });


app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});



//register
app.get("/register", (req, res) =>{
  let templateVars = {
    username: req.cookies["username"]
  }
  res.render("register", templateVars);
});


app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls"); // redirect back to the page after deleting
});

app.post("/login", (req, res) =>{ //loging as user
  res.cookie("username", req.body.username)
  res.redirect("/urls")
  let templateVars = {
    username: req.cookies["username"]}
    res.render("urls_index", templateVars);
  });

  app.post("/logout", (req, res) => { //Logout back to homepage
    (res.clearCookie('username', req.body.username));
    res.redirect("urls");
  })

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
}); 

  app.post("/urls", (req, res) =>{ // What happens to the urlDatabase when the server is restarted
    let templateVars = { 
      status: 401,
      message: ' must authenticate to get the requested response.',
      user: users[req.session.user_id],
      username: req.cookies["username"]
    }
  });

  //register

  app.post("/register",(req,res) => {
    let userEmail = req.body.email;
    let userPassword = req.body.password;
    let ranndomUserID= generateRandomString();
    user[ranndomUserID]= {
      id:ranndomUserID,
      email: userEmail,
      password: userPassword
    }
    res.cookie("randomUSerID", ranndomUserID); //set a user_id cookie containing the user's newly generated ID
    res.redirect("/urls")//Redirect the user to the /urls page.
  });