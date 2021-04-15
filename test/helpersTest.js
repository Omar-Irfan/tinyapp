const { assert } = require('chai');
const bcrypt = require('bcrypt')

const { generateRandomString, fetchUserID, emailLookUp, emailPasswordLookUp, fetchIDwEmail, urlsForUser } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    hashedPassword: bcrypt.hashSync("purple-monkey-dinosaur", 10)
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    hashedPassword: bcrypt.hashSync("dishwasher-funk", 10)
  }
};

const testUsers1 = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    hashedPassword: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    hashedPassword: "dishwasher-funk"
  }
};

//Tests for fetchIDwEmail function


describe('Tests for fetchIDwEmaill', function() {

  it('should return the user id associated with the email', function() {
    const user = fetchIDwEmail("user@example.com", testUsers)
    const expectedOutput = "userRandomID";
    assert.strictEqual(user, expectedOutput);
    
  });

  it('should return a undefined when email is not valid', function() {
    const user = fetchIDwEmail("user@love.com", testUsers)
    const expectedOutput = undefined;
    assert.strictEqual(user, expectedOutput);
    
  });

  it('should return a undefined when given empty string', function() {
    const user = fetchIDwEmail("", testUsers)
    const expectedOutput = undefined;
    assert.strictEqual(user, expectedOutput);
    
  });

  it('should return a undefined when given no database', function() {
    const user = fetchIDwEmail("user@example.com")
    const expectedOutput = undefined;
    assert.strictEqual(user, expectedOutput);
    
  });
});

//Tests for generateRandomString function

describe('Tests for generateRandomString function', function() {

  it('should have a length of 6', function() {
    const randomStr = generateRandomString()
    const expectedOutput = 6;
    assert.strictEqual(randomStr.length, expectedOutput);
    
  });
  it('should be a string', function() {
    const randomStr = generateRandomString()
    assert.isString(randomStr);
    
  });
});

//Tests for fetchUserID function
describe('Tests for fetchUserID function', function() {

  it('should return object when given valid user id', function() {
    const id = fetchUserID('userRandomID', testUsers1)
    const expectedOutput = {
      id: "userRandomID", 
      email: "user@example.com", 
      hashedPassword: "purple-monkey-dinosaur"
    };
    assert.deepEqual(id, expectedOutput);
   });

   it('should return undefined when given invalid user id', function() {
    const id = fetchUserID('RandomID', testUsers)
    const expectedOutput = undefined
    assert.deepEqual(id, expectedOutput);
   });

   it('should return undefined when given empty string', function() {
    const id = fetchUserID('', testUsers)
    const expectedOutput = undefined
    assert.deepEqual(id, expectedOutput);
   });

   it('should return undefined when given no database', function() {
    const id = fetchUserID('userRandomID', )
    const expectedOutput = undefined
    assert.deepEqual(id, expectedOutput);
   });
});

//Tests for emailLookUp function
describe('Tests for emailLookUp function', function() {

  it('should return email when given valid user email', function() {
    const email = emailLookUp('user@example.com', testUsers)
    const expectedOutput = 'user@example.com'
    assert.strictEqual(email, expectedOutput);
  });

  it('should return undefined when given invalid email', function() {
    const email = emailLookUp('RandomEmail', testUsers)
    const expectedOutput = undefined
    assert.strictEqual(email, expectedOutput);
  });

  it('should return undefined when given empty string', function() {
    const email = emailLookUp('', testUsers)
    const expectedOutput = undefined
    assert.strictEqual(email, expectedOutput);
   });

   it('should return undefined when given no database', function() {
    const id = emailLookUp('user@example.com', )
    const expectedOutput = undefined
    assert.strictEqual(id, expectedOutput);
   });
});

//Tests for emailPasswordLookUp function

describe('Tests for emailPasswordLookUp function', function() {

  it('should return email when given valid email and password', function() {
    const email = emailPasswordLookUp('user@example.com', "purple-monkey-dinosaur",  testUsers)
    const expectedOutput = 'user@example.com'
    assert.strictEqual(email, expectedOutput);
  });

  it('should return undefined when given invalid email', function() {
    const email = emailPasswordLookUp('RandomEmail', "purple-monkey-dinosaur", testUsers)
    const expectedOutput = undefined
    assert.strictEqual(email, expectedOutput);
  });

  it('should return undefined when given empty string for email', function() {
    const email = emailPasswordLookUp('', "purple-monkey-dinosaur", testUsers)
    const expectedOutput = undefined
    assert.strictEqual(email, expectedOutput);
   });

   it('should return undefined when given no database', function() {
    const id = emailPasswordLookUp('user@example.com', "purple-monkey-dinosaur" )
    const expectedOutput = undefined
    assert.strictEqual(id, expectedOutput);
   });

   it('should return undefined when given valid email and invalid password', function() {
    const email = emailPasswordLookUp('user@example.com', "omar",  testUsers)
    const expectedOutput = undefined
    assert.strictEqual(email, expectedOutput);
  });
});

//Tests for urlsForUser function

const testDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" },i89oGr: { longURL: "https://www.youtube.ca", userID: "aJ89lW" }
};

describe('Tests for urlsForUser function', function() {

  it('should return object of urls that correspond with given id', function() {
    const email = urlsForUser('aJ48lW', testDatabase)
    const expectedOutput = {
      b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
      i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
    }
    assert.deepEqual(email, expectedOutput);
  });
  it('should return empty object when given invalid id', function() {
    const email = urlsForUser('aJhfushf', testDatabase)
    const expectedOutput = {}
    assert.deepEqual(email, expectedOutput);
  });
});