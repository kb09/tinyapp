const express = require("express");
const app = express(); 
const morgan = require("morgan");
const cookieSession = require("cookie-session");
const bcryptjs = require("bcryptjs");
const { urlsForUser, getUserByEmail, generateRandomString,} = require("./helper");
const PORT = 8080;
app.set("view engine", "ejs");
app.use(express.json());
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));


app.use(
  cookieSession({
    name: "session",
    keys: ["key1", "key2"],
  })
);

const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: 'userRandomID',
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: 'user2RandomID'
  },
};

const users= {}; 

//register
app.get("/register", (req, res) => {
  const userId = req.session.userID;
  const user = users[userId];
  if (user) {
    return res.redirect("/urls");
  }
  return res.render("registrationForm", { user });
});

//validate user information
app.post("/register", (req, res) => {
    
  //validate Email
  const { email, password } = req.body;
  if (email && password) {
    if (!getUserByEmail(email, users)) { //Add user
      const id = generateRandomString();
      const hashedPassword = bcryptjs.hashSync(password, 10);//hashed pass
      const user = { id, email, password: hashedPassword };
      users[id] = user;
      req.session.userID = id;
      return res.redirect("/urls");
    }
    return res.status(400).send("<h4>Error 400: Email already exists</h4>");
  }
  return res.status(400).send("<h4>Error 400: Email and Password can not be empty</h4>");
});

//login
app.get("/login", (req, res) => {
  const userId = req.session.userID;
  const user = users[userId];
  if (user) {
    return res.redirect("/urls");
  }
  return res.render("logInform", { user });
});

//validate login
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (email && password) {
    const user = getUserByEmail(email, users);
    if (user) {
      const isCorrectPassword = bcryptjs.compareSync(password, user["password"]);
      if (isCorrectPassword) {
        req.session.userID = user["id"];
        return res.redirect("/urls");
      }
      return res.status(403).send("<h2>Error 403: Password does not exist</h2>");
    }
    return res.status(403).send("<h4>Error 403:Email does not exist</h4>");
  }
  return res.status(400).send("<h5>Error 400: Empty input</h5>");
});

//logout and clear cookies
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/login');
});

//Delete url
app.post("/urls/:shortURL/delete", (req, res) => {
  const userID = req.session.userID;
  const user = users[userID];
  if (user) {
    const shortURL = req.params.shortURL;
    if (urlDatabase[shortURL]["userID"] === userID) { // if authorized to delete
      delete urlDatabase[shortURL];
      return res.redirect("/urls"); // redirect back to the page after deleting
    }
    return res.send("<h4>Error 403: User authorization error</h4>");
  }
  return res.send(
    "<h4>Error 400: User not logged in</h4> <p><a href='/login'>Please LogIn</a></p>"
  );
});

app.get('/', (req, res) => {
  let user = users[req.session['user_id']];
  if (!user) {  // if user is not logged in redirect to /login

    res.redirect('/login');
  } else {
    res.redirect('/urls'); // if user is logged in redirect to /urls
  }
});

//validate urls
app.get("/urls", (req, res) => {
  const userId = req.session.userID;
  const user = users[userId];
  if (!user) {
    res.status(403).send('Error 403 must sign in'); // error if not signed in

  }
  const templateVars = { urls: urlsForUser(user["id"], urlDatabase), user };
  return res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const userId = req.session.userID;
  const user = users[userId];
  if (user) {
    return res.render("urls_new", { user });
  }
  return res.redirect("/login");
});

app.post("/urls", (req, res) => {
  const userId = req.session.userID;
  const user = users[userId];

  if (user) {
    const newShortUrl = generateRandomString();
    const longURL = req.body.longURL;
    const userID = user["id"];
    urlDatabase[newShortUrl] = { longURL, userID };
    return res.redirect(`/urls/${newShortUrl}`);
  }
  return res.status(401).send("<h4>Error 400: You do not have access</h4>");
});

// Uses shortURL to go to longURL 
app.get('/u/:shortURL', (req, res) => {
  const url = urlDatabase[req.params.shortURL];
  
  if (url === undefined) { // if shortURL not in db
    res.redirect('/not_found');
    return;
  }

  let adding = url.longURL; // adding http:// so all shortUrl have it even if not included from user
  if (adding.includes('http://') || adding.includes('https://')) {
    return res.redirect(go);
  }

  res.redirect(`http://${adding}`);
});

app.post("/urls/:shortURL", (req, res) => {
  const userID = req.session.userID;
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  const user = users[userID];
  if (user) {
    if (shortURL && urlDatabase[shortURL]) {
      if (urlDatabase[shortURL]["userID"] === userID) {
        urlDatabase[shortURL] = { longURL, userID };
        return res.redirect("/urls");
      }
      return res.send("<h4>Error 400: User authorization error</h4>");
    }
    return res.send("<h4>Error 400: Url was not found</h4>");
  }
  return res.send(
    "<h4>Error 400: User not logged in</h4> <p><a href='/login'>Please Login</a></p>"
  );
});

app.get("/urls/:shortURL", (req, res) => {
  const user = users[req.session.userID];
  const shortURL = req.params.shortURL;
  if (urlDatabase[shortURL]) { // if shortURL is in db
    if (user) {
      const { longURL, userID } = urlDatabase[shortURL];
      if (userID === user.id) { //if shortURL if the users

        return res.render("urls_show", { shortURL, longURL, user });
      }
      return res.status(401).send("<h4>Error 400: You do not have access</h4>");
    }
    return res.send(
      "<h4>Error 400: User not logged in</h4> <p><a href='/login'>Please Login</a></p>"
    );
  }
  return res.send(
    "<h4>Error 400: URL not found</h4> <p><a href='/urls'>Go Home</a></p>"
  );
});

app.listen(PORT, () => {
  console.log(`Server is listening on ${PORT}`);
});
