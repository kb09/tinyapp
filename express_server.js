const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080;
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

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

const userURL = function (urlData, id) {
  let newData = {};
  for (const i in urlData) {
    if (urlData[i].userID === id) {
      newData[i] = urlData[i];
    }
  }
  return newData;
};


const userData = {

};

//Random string (6 chars)
function generateRandomString() {
  return Math.random().toString(36).substring(2, 8);
};

// Checks for email and password 

app.post('/register', (req, res) => {
  if (req.body.email === '' || req.body.password === '') {
    res.send('400 input not found'); // empty input when regiestering 
  }

  for (const user in userData) {
    if (userData[user].email === req.body.email) { // registering with email already in use
      return res.status(404).send('404 Email already used');
    }
  }

  const newUser = {
    "id": generateRandomString(), 
    'email': req.body.email,
    'password': req.body.password
  };
  res.cookie('user_id', newUser["id"]);
  const key = newUser["id"];
  userData[key] = newUser;
  res.redirect('/urls');
});

app.get('/login', (req, res) => {
  const templateVars = {
    email: userData[req.cookies['user_id']]
  };
  res.render('urls_login', templateVars);
});

app.get('/', (req, res) => { // default hello 
  res.send('Hello!');
});

app.get('/register', (req, res) => { // register template 
  const templateVars = {
    email: undefined
  };
  res.render('urls_register', templateVars);
});

app.get('/urls', (req, res) => {
  const user = userData[req.cookies['user_id']];
  if (!user) {
    const templateVars = {
      email: undefined,
    }
    return res.render('urls_login', templateVars)
  } else {
    let emailPass = user.email;

    const moreData = userURL(urlDatabase, userData[req.cookies['user_id']].id);
    
    const templateVars = { 
      urls: moreData, 
      email: emailPass,
    };
    res.render('urls_index', templateVars);
  }
});

//Delete url 

app.post('/urls/:shortURL/delete', (req, res) => {
  let uniqueID = userData[req.cookies['user_id']].id
  if (urlDatabase[req.params.shortURL].userID === uniqueID) {
    delete urlDatabase[req.params.shortURL];
    res.redirect('/urls');
  }
});

//Redirect to edit page

app.post('/urls/:shortURL/edit', (req, res) => {
  let uniqueID = userData[req.cookies['user_id']].id;
  if (urlDatabase[req.params.shortURL].userID === uniqueID) {
    urlDatabase[req.params.shortURL].longURL = req.body.editURL;
    res.redirect('/urls');
  }
});

//Validate user data 

app.post('/login', (req, res) => {
  if (req.body.email === '' || req.body.password === '') {
    res.status(400).send('400 Invalid Entry'); // empty input when logging in 
  }
  for (const user in userData) {
    if (userData[user].email !== req.body.email) { // invalid Email 
      return res.status(403).send('403 Email not valid');
    }if (userData[user].email === req.body.email) { // Valid Email but invalid password
      if (userData[user].password !== req.body.password) {
        return res.status(403).send('403 Incorrect Password');
      }
      if (userData[user].password === req.body.password && userData[user].email === req.body.email) {
        res.cookie('user_id', userData[user]["id"]); // valid email and password 
        return res.redirect('/urls');
      }
    }
  }
  res.redirect('/urls');
});

//Clear cookies when logging out 
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/register');
});

app.post('/urls/:shortURL', (req, res) => {
  if (!req.body.editURL) {
    const shortURL = req.params.shortURL
    return res.redirect(`/urls/${shortURL}`);
  } else {
    const user = userData[req.cookies['user_id']];

  urlDatabase[req.params.shortURL] = {
    longURL: req.body.longURL,    //*****//editURL,
    userID: user.id,
  };
    return res.redirect('/urls');
  }
});

// Generate shortURl for longURL

app.post('/urls', (req, res) => {
  const randomShortURL = generateRandomString();
  const user = userData[req.cookies['user_id']];
  urlDatabase[randomShortURL] = {
    longURL: req.body.longURL,
    userID: user.id,
  };
  res.redirect(`/urls/${randomShortURL}`); //Redirect to shortURL 
});

app.get('/urls/new', (req, res) => {
  const user = userData[req.cookies['user_id']];
  if (user === undefined) {
    const templateVars = {
      email: undefined
    };
    return res.render('urls_login', templateVars)
  } else {
    const templateVars = {
      email: user.email,
    };
    return res.render('urls_new', templateVars);
  }
});

app.get('/urls/:shortURL', (req, res) => {
  const user = userData[req.cookies['user_id']];
  if (!user) {
    const templateVars = {
      urls: urlDatabase,
      email: undefined
    }
    return res.render('urls_index', templateVars)
  } else {
    let emailPass = user.email;
    const templateVars = { 
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL].longURL,
      email: emailPass, 
    };
    res.render('urls_show', templateVars);
  }
});

app.get('/u/:shortURL', (req, res) => {
  const longestURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longestURL);
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n');
});

app.listen(PORT, () => {
  console.log(`Example app listening on ${PORT}`);
});


/* 


TEST


A user can register √
A user cannot register with an email address that has already been used √
A user can log in with a correct email/password √
A user sees the correct information in the header √
A user cannot log in with an incorrect email √ OR password √
A user can log out √



*/