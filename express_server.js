const express = require('express');
const bodyParser = require('body-parser');

const cookieSession = require('cookie-session')
const bcryptjs = require('bcryptjs');
const app = express();
const PORT = 8080;
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

app.use(
  cookieSession({
    name: 'session',
    keys: ['key1', 'key2'],
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

const urlsForUser = function (urlDB, id) {
  let newDB = {};
  for (const i in urlDB) {
    if (urlDB[i].userID === id) {
      newDB[i] = urlDB[i];
    }
  }
  return newDB;
};


const usersDB = {










};


function generateRandomString() {
  return Math.random().toString(36).substring(2, 8);
};




app.get('/register', (req, res) => {
  const templateVars = { email: undefined };
  res.render('urls_register', templateVars);
});


app.post('/register', (req, res) => {
  if (req.body.email === '' || req.body.password === '') {
    res.status(400).send('400 error');
  }

  
  for (const user in usersDB) {
    if (usersDB[user].email === req.body.email) {
      return res.status(400).send('400 error');
    }
  }

  
  const newUser = {
    "id": generateRandomString(), 
    'email': req.body.email,
    'password': bcryptjs.hashSync(req.body.password, 10),
  };
  
  req.session['user_id'] = newUser['id'];
  const key = newUser["id"];
  usersDB[key] = newUser;
  res.redirect('/urls');
});



app.get('/login', (req, res) => {
  const templateVars = {
    email: usersDB[req.session['user_id']]
  };
  res.render('urls_login', templateVars);
});


app.post('/login', (req, res) => {
  if (req.body.email === '' || req.body.password === '') {
    res.status(403).send('403');
  }
  
  for (const user in usersDB) {
    if (usersDB[user].email === req.body.email) {
      
        if (!(bcryptjs.compareSync(req.body.password, usersDB[user].password))){
        return res.status(403).send('403');
      }
      
        if (bcryptjs.compareSync(req.body.password, usersDB[user].password) && usersDB[user].email === req.body.email){
        
        req.session['user_id'] = usersDB[user]["id"];
        return res.redirect('/urls');
      }
    }
    
  }
  res.redirect('/urls');
  
  
  
  
  
  
  
  
  
  
  
  
  
  
});


app.post('/logout', (req, res) => {
  
  
  req.session = null;
  
  res.redirect('/register');
});




app.post('/urls/:shortURL/delete', (req, res) => {
  let uniqueID = usersDB[req.session['user_id']].id;
  if (urlDatabase[req.params.shortURL].userID === uniqueID) {
    delete urlDatabase[req.params.shortURL];
    res.redirect('/urls');
  }
});


app.post('/urls/:shortURL/edit', (req, res) => {
  let uniqueID = usersDB[req.session['user_id']].id;
  if (urlDatabase[req.params.shortURL].userID === uniqueID) {
    urlDatabase[req.params.shortURL].longURL = req.body.editURL;
    res.redirect('/urls');
  }
});




app.get('/urls', (req, res) => {
  const user = usersDB[req.session['user_id']];
  if (!user) {
    const templateVars = {
      email: undefined,
    }
    return res.render('urls_login', templateVars);
  } else {
    let emailPass = user.email;
    const superDB = urlsForUser(urlDatabase, usersDB[req.session['user_id']].id);
    const templateVars = { 
      urls: superDB, 
      email: emailPass,
    };
    res.render('urls_index', templateVars);
  }
});


app.get('/urls/new', (req, res) => {
  const user = usersDB[req.session['user_id']];
  if (!user) {
    const templateVars = { email: undefined };
    return res.render('urls_login', templateVars)
  } else {
    const templateVars = { email: user.email };
    return res.render('urls_new', templateVars);
  }
});


app.post('/urls', (req, res) => {
  const randomShortURL = generateRandomString();
  const user = usersDB[req.session['user_id']];

  urlDatabase[randomShortURL] = {
    longURL: req.body.longURL,
    userID: user.id,
  };
  res.redirect(`/urls/${randomShortURL}`); 
});


app.get('/urls/:shortURL', (req, res) => {
  let user = usersDB[req.session['user_id']];
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


app.post('/urls/:shortURL', (req, res) => {
  if (!req.body.editURL) {
    const shortURL = req.params.shortURL
    return res.redirect(`/urls/${shortURL}`);
  } else {
    const user = usersDB[req.session['user_id']];
    urlDatabase[req.params.shortURL] = {
    longURL: req.body.editURL,
    userID: user.id,
    };
    return res.redirect('/urls');
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


app.get('/', (req, res) => {
  res.send('Hello!');
});


app.listen(PORT, () => {
  console.log(`Example app listening on ${PORT}`);
});