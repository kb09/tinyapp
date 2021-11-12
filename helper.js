const urlsForUser = function(urlDB, id) {
  let newDB = {};
  for (const i in urlDB) {
    if (urlDB[i].userID === id) {
      newDB[i] = urlDB[i];
    }
  }
  return newDB;
};

function generateRandomString() {
  return Math.random().toString(36).substring(2, 8);
}

const getUserByEmail = function(usersDB, inputEmail) {
  for (const user in usersDB) {
    if (usersDB[user].email === inputEmail) {
      return usersDB[user];
    }
  }
  
};

module.exports = { urlsForUser, generateRandomString, getUserByEmail };