
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
let cookieParser = require('cookie-parser');
const bodyParser = require("body-parser"); 
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
const bcrypt = require('bcrypt');


app.set("view engine", "ejs");

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    hashedPassword: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    hashedPassword: "omar"
  }
}

app.post("/register", (req,res) => {
  const uID = generateRandomString()
  if (!req.body.email || !req.body.password) {
    res.status(400).send('ERROR: Empty Field')
  }
  let email = req.body.email
  if (emailLookUp(email, users) === email){
    res.status(400).send('This email is already in use')
  }
  console.log(req.body)
  users[uID] = req.body
  users[uID]['hashedPassword'] = bcrypt.hashSync(req.body.password, 10);
  delete users[uID]['password'];
  users[uID]['id'] = uID;
  res.cookie('user_id', uID);
  res.redirect('/urls');
});

function generateRandomString() {
  let stringList = '1234567890qwertyuiopasdfghjklzxcvbnm'
  let randomStr = ''
  for (let i = 0; i < 6; i++) {
    let randomVal = Math.floor(Math.random() * stringList.length) + 1;
    randomStr = randomStr + stringList[randomVal-1];
  }
  return randomStr;
}

const fetchUserID = (id, database) => {
  for (let userID in database) {
    if (userID === id) {
      return database[userID];
    }
  } return undefined;
};

const emailLookUp = (email, database) => {
  for (let userID in database) {
    if (database[userID]['email'] === email) {
      return database[userID]['email'];
    }
  } return undefined;
};
const emailPasswordLookUp = (email, password, database) => {
  for (let userID in database) {
    if (database[userID]['email'] === email && bcrypt.compareSync(password, database[userID]['hashedPassword'])) {
        return database[userID]['email'];
      }
  } return undefined;
};

const fetchIDwEmail = (email, database) => {
  for (let id in database) {
    for (let key in database[id]) {
      if (key === 'email' && database[id][key] === email) {
        return id;
      }
    }
  } return undefined;
};
const urlsForUser = (id, database) => {
  let userUrls = {}
  for (let key in database) {
    if (database[key].userID === id) {
      userUrls[key] = database[key]
    }
  } return userUrls;

};

app.post("/urls", (req,res) => {
  const short = generateRandomString()
  urlDatabase[short] = req.body
  urlDatabase[short]['userID'] = req.cookies['user_id']
  res.redirect(`/urls/${short}`);

});

app.post("/urls/:shortURL/delete", (req,res) => {
  const userID = req.cookies['user_id']
  const user = fetchUserID(userID,users);
  const userLog = urlDatabase[req.params.shortURL]['userID']
  if(userLog === user) {
    delete urlDatabase[req.params.shortURL]
    res.redirect('/urls');
  } else {
    res.send('please sign in to delete')
  }
});

app.post("/urls/:shortURL", (req, res) => {
  const userID = req.cookies['user_id']
  const user = fetchUserID(userID,users);
  const userLog = urlDatabase[req.params.shortURL]['userID']
  if(userLog === user) {
    const short = req.params.shortURL;
    urlDatabase[short] = Object.values(req.body);
    urlDatabase[short]['userID'] = userID
    res.redirect('/urls');
  } else {
    res.send('please sign in to edit')
  }
});

app.post("/urls/:shortURL/edit", (req, res) => {
  const userID = req.cookies['user_id']
  const user = fetchUserID(userID,users);
  const userLog = urlDatabase[req.params.shortURL]['userID']
  if(userLog === user) {
  const short = req.params.shortURL
  res.redirect(`/urls/${short}`)
  } else {
    res.send('please sign in to edit')
  }
});

app.post("/login", (req, res) => {
  if (!emailLookUp(req.body.email, users)) {
    res.status(403).send('Sorry there is no account with that email')
  } if (!emailPasswordLookUp(req.body.email, req.body.password, users)) {
    res.status(403).send('Incorrect password')
  } if (emailPasswordLookUp(req.body.email, req.body.password, users)) {
    let id = fetchIDwEmail(req.body.email, users)
    res.cookie('user_id', id)
    res.redirect('/urls'); }
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id')
  res.redirect('/urls');
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/register.json", (req, res) => {
  res.json(users);
});


app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls", (req, res) => {
  const userID = req.cookies['user_id']
  const user = fetchUserID(userID,users);
  const urlsToUse = urlsForUser(userID, urlDatabase)
  const templateVars = { urls: urlsToUse,  user: user}
  res.render("urls_index", templateVars);
});

app.get("/login", (req,res) => {
  const userID = req.cookies['user_id']
  const user = fetchUserID(userID,users);
  const templateVars = {user: user};
  res.render("login", templateVars);
});

app.get("/register", (req, res) => {
  const userID = req.cookies['user_id']
  const user = fetchUserID(userID,users);
  const templateVars = {user: user};
  res.render("register", templateVars);
});

app.get("/urls/new", (req, res) => {
  const userID = req.cookies['user_id']
  const user = fetchUserID(userID,users);
  if(user) {
  const templateVars = {user: user};
  res.render("urls_new", templateVars);
  } res.redirect('/login');
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]['longURL']
  res.redirect(longURL);
});

app.get("/urls/:shortURL", (req, res) => {
  const userID = req.cookies['user_id']
  const user = fetchUserID(userID,users);
  const templateVars = {shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]['longURL'], userID: urlDatabase[req.params.shortURL]['userID'], user: user};
  res.render("urls_show", templateVars);
})