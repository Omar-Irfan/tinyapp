const bcrypt = require('bcrypt');

const generateRandomString = () => { //function generates random string of 6 alphanumeric characters
  let stringList = '1234567890qwertyuiopasdfghjklzxcvbnm';
  let randomStr = '';
  for (let i = 0; i < 6; i++) {
    let randomVal = Math.floor(Math.random() * stringList.length) + 1;
    randomStr = randomStr + stringList[randomVal - 1];
  }
  return randomStr;
};

const fetchUserID = (id, database) => { //fetches corresponding object from database given a user id
  for (let userID in database) {
    if (userID === id) {
      return database[userID];
    }
  } return undefined;
};

const emailLookUp = (email, database) => { //looks up email in database and confirms if its there
  for (let userID in database) {
    if (database[userID]['email'] === email) {
      return database[userID]['email'];
    }
  } return undefined;
};

const emailPasswordLookUp = (email, password, database) => { //confirms if email and corresponding password (after encryption) are present in data base
  for (let userID in database) {
    if (database[userID]['email'] === email && bcrypt.compareSync(password, database[userID]['hashedPassword'])) {
      return database[userID]['email'];
    }
  } return undefined;
};

const fetchIDwEmail = (email, database) => { //fetches corresponding user id from database when given and email
  for (let id in database) {
    for (let key in database[id]) {
      if (key === 'email' && database[id][key] === email) {
        return id;
      }
    }
  } return undefined;
};

const urlsForUser = (id, database) => { //returns object that only show objects in database that correspond to the user id given
  let userUrls = {};
  for (let key in database) {
    if (database[key].userID === id) {
      userUrls[key] = database[key];
    }
  } return userUrls;

};

module.exports = { generateRandomString, fetchUserID,emailLookUp, emailPasswordLookUp, fetchIDwEmail, urlsForUser };