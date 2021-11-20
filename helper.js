
const urlsForUser = function(urlDB, id) {
  let newData = {};
  for (const i in urlDB) {
    if (urlDB[i].userID === id) {
      newData[i] = urlDB[i];
    }
  }
  return newData;
};

// random string generator 
function generateRandomString() {
  return Math.random().toString(36).substring(2, 8);
}

//Getting email for the user 
const getUserByEmail = function(userData, inputEmail) {
  for (const user in userData) {
    if (userData[user].email === inputEmail) {
      return userData[user];
    }
  }
  
};





module.exports = { urlsForUser, generateRandomString, getUserByEmail };