const {generateRandomString, fetchUserID, emailLookUp, emailPasswordLookUp, fetchIDwEmail, urlsForUser} = require("./helpers.js"); //imports functions from helper file
const express = require("express"); //imports express
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser"); //imports body parser middleware
app.use(bodyParser.urlencoded({extended: true}));
const bcrypt = require('bcrypt'); //imports bcrypt middleware
const cookieSession = require('cookie-session'); //imports cookie-session middleware
app.use(cookieSession({name: 'user_id',
  keys: ['fyfyufjkfyfysedt', 'ftfjhfgfhgvj'],})); //set encryption key for cookie session
app.set("view engine", "ejs"); //sets engine

const urlDatabase = {}; //Database of original urls and their corresponding short urls

const users = {}; //Database of user accounts

app.post("/register", (req,res) => {
  const uID = generateRandomString();
  if (!req.body.email || !req.body.password) { //if either field is empty on registration page returns error
    res.status(400).send('ERROR: Empty Field');
    return;
  }
  if (emailLookUp(req.body.email, users) === req.body.email) { // if email is already in use, returns error
    res.status(400).send('This email is already in use');
    return;
  } //creates new user id for corresponding email and password encrypts user password sets a cookie and redirects to /urls
  let user = {id: uID, email: req.body.email, hashedPassword: bcrypt.hashSync(req.body.password, 10)};
  users[uID] = user;
  req.session.user_id = uID;
  res.redirect('/urls');
  return;
});

app.post("/urls", (req,res) => { //renders /urls page
  const short = generateRandomString(); //generates random string to represent short url
  urlDatabase[short] = req.body; //adds random string as object in urlDatabase and gives it corresponding long url and user id
  urlDatabase[short]['userID'] = req.session.user_id;
  res.redirect(`/urls/${short}`);
  return; //redirects to page using random string as part of url

});

app.post("/urls/:shortURL/delete", (req,res) => { //linked to delete button on "urls" page
  const userID = req.session.user_id;
  const currentUser = fetchUserID(userID,users);
  const owner = urlDatabase[req.params.shortURL]['userID'];
  if (!currentUser) {
    res.status(400).send('You are not logged in');
    return;
  }
  if (currentUser.id === owner) {
    delete urlDatabase[req.params.shortURL]; //if url belongs to user and button is clicked then removes shortURL object from database
    res.redirect('/urls');
    return;
  } else { //Failsafe incase unauthorized user uses curl or other backend means to delete url
    res.send('please sign in to delete');
    return;
  }
});

app.post("/urls/:shortURL", (req, res) => {
  const userID = req.session.user_id;
  const currentUser = fetchUserID(userID,users);
  const owner = urlDatabase[req.params.shortURL]['userID'];
  if (!currentUser) {
    res.status(400).send('You are not logged in');
    return;
  }
  if (currentUser.id === owner) { //if user is logged in and owns url then allows updating url and redirects to /urls
    const shortURL = req.params.shortURL;
    urlDatabase[shortURL] = Object.values(req.body);
    urlDatabase[shortURL]['userID'] = userID;
    res.redirect('/urls');
    return;
  } else { //Failsafe incase unauthorized user uses curl or other backend means to edit url
    res.send('please sign in to edit');
    return;
  }
});

app.post("/login", (req, res) => {
  if (!emailLookUp(req.body.email, users)) { //if email does not exist in database displays following error
    res.status(403).send('Sorry there is no account with that email');
    return;
  } if (!emailPasswordLookUp(req.body.email, req.body.password, users)) { //if password is incorrect, displays following error
    res.status(403).send('Incorrect password');
    return;
  } if (emailPasswordLookUp(req.body.email, req.body.password, users)) { //if both email address and password are valid prints
    let id = fetchIDwEmail(req.body.email, users);
    req.session.user_id = id;
    res.redirect('/urls');
    return;
  }
});

app.post("/logout", (req, res) => { //clears cookies when logout button is clicked and redirects to /urls
  req.session = null;
  res.redirect('/urls');
  return;
});

app.get("/", (req, res) => {
  const currentUserID = req.session.user_id;
  const currentUser = fetchUserID(currentUserID,users);
  if (currentUser) { //If user is logged in, redirects to /urls
    res.redirect('/urls');
    return;
  }
  res.redirect('/login');
  return; //if user is not logged in redirects to /login
});


app.get("/urls", (req, res) => { //renders /urls page
  const userID = req.session.user_id;
  const user = fetchUserID(userID,users);
  const urlsToUse = urlsForUser(userID, urlDatabase); //filters which urls to display based on user id
  const templateVars = { urls: urlsToUse,  user: user};
  res.render("urls_index", templateVars);
  return;
  //passers user object (for header) and  filtered object of urls to urls_index.ejs page
});

app.get("/login", (req,res) => { //renders login page
  const currentUserID = req.session.user_id;
  const currentUser = fetchUserID(currentUserID,users);
  const templateVars = {user: currentUser};
  if (currentUser) {
    res.redirect("/urls");
    return; //if user is logged on, redirects to /urls
  }
  res.render("login", templateVars);
  return; //if user is not logged in, renders login page and passes user object to ejs (for header)
});

app.get("/register", (req, res) => { //renders register page
  const currentUserID = req.session.user_id;
  const currentUser = fetchUserID(currentUserID,users);
  const templateVars = {user: currentUser};
  if (currentUser) {
    res.redirect("/urls");
    return; //if user is logged in, redirects to urls
  }
  res.render("register", templateVars);
  return; //if user is not logged in, renders register page and passes user object to ejs (for header)
});

app.get("/urls/new", (req, res) => { //renders /urls/new page
  const currentUserID = req.session.user_id;
  const currentUser = fetchUserID(currentUserID,users);
  if (currentUser) { //if a user is logged in, renders page and passes user object (for header)
    const templateVars = {user: currentUser};
    res.render("urls_new", templateVars);
    return;
  } res.redirect('/login');
  return; //if user is not logged in, redirects to /login page
});

app.get("/u/:shortURL", (req, res) => { //clicking or typing short url link redirects user to long url destination
  if (!urlDatabase[req.params.shortURL]) { //if short url doesn't exist, displays error
    res.status(404).send('404 Error: Page not Found');
    return;
  }
  const longURL = urlDatabase[req.params.shortURL]['longURL'];
  res.redirect(longURL);
  return; //if short url exist then user is redirected to corresponding long url
});

app.get("/urls/:shortURL", (req, res) => { //renders page for each individual short url, also linked to edit button
  const currentUserID = req.session.user_id;
  const currentUser = fetchUserID(currentUserID,users);
  if (!urlDatabase[req.params.shortURL]) { //if short url doesn't exist displays 404 error
    res.status(404).send('404 Error: Page not Found');
    return;
  }
  const owner = urlDatabase[req.params.shortURL]['userID'];
  if (!currentUserID) { //if not logged in, displays error that user is not lgged in
    res.status(400).send('You are not logged in');
    return;
  } if (currentUser.id !== owner) { //if logged in but url does not belong to current user then error is displayed
    res.status(400).send('This URL does not belong to you');
    return;
  } const templateVars = {shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]['longURL'], userID: urlDatabase[req.params.shortURL]['userID'], user: currentUser};
  res.render("urls_show", templateVars);
  return; //if logged in and url belongs to current user then page is shown
});

app.listen(PORT, () => { //When server activates on port prints this message
  console.log(`TinyApp server is online on port ${PORT}!`);
});