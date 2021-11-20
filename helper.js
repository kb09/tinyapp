const urlsForUser = function(urlDB, id) {
  let newData = {};
  for (const i in urlDB) {
    if (urlDB[i].userID === id) {
      newData[i] = urlDB[i];
    }
  }
  return newData;
};

function generateRandomString() {
  return Math.random().toString(36).substring(2, 8);
}

const getUserByEmail = function(userData, inputEmail) {
  for (const user in userData) {
    if (userData[user].email === inputEmail) {
      return userData[user];
    }
  }
  
};





module.exports = { urlsForUser, generateRandomString, getUserByEmail };