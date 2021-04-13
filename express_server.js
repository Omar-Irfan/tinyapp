function generateRandomString() {
  let stringList = '1234567890qwertyuiopasdfghjklzxcvbnm'
  let randomStr = ''
  for (let i = 0; i < 6; i++) {
    let randomVal = Math.floor(Math.random() * stringList.length) + 1;
    randomStr = randomStr + stringList[randomVal-1];
  }
  return randomStr;
}

const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
let cookieParser = require('cookie-parser') 
const bodyParser = require("body-parser"); 
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser())


app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.post("/urls", (req,res) => {
  const short = generateRandomString()
  urlDatabase[short] = Object.values(req.body)[0];
  res.redirect(`/urls/${short}`);
});

app.post("/urls/:shortURL/delete", (req,res) => {
  delete urlDatabase[req.params.shortURL]
  res.redirect('/urls');
});

app.post("/urls/:shortURL", (req, res) => {
  const short = req.params.shortURL;
  const long = req.body.longURL;
  urlDatabase[short] = long;
  res.redirect('/urls');
});

app.post("/urls/:shortURL/edit", (req, res) => {
  let short = req.params.shortURL
  res.redirect(`/urls/${short}`)
});

app.post("/login", (req, res) => {
  res.cookie('username', req.body.username)
  res.redirect('/urls');
});

app.post("/logout", (req, res) => {
  res.clearCookie('username')
  res.redirect('/urls');
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

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase,  username: req.cookies["username"]}
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {username: req.cookies["username"]}
  res.render("urls_new", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], username: req.cookies["username"]};
  res.render("urls_show", templateVars);
})