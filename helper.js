const {users} = require("./express_server");
const {generateRandomString} = require("./express_server");

/*If the e-mail or password are empty strings, send back 
a response with the 400 status code.*/
const validateInformation = (email, password, users) => {
  if ( email === "" || password === ""){
    let response = {
      status: 404,
      message: ' 404  missing email or password',
    }
    res.status(404)
    res.render('missing input', response)

  }

}


module.exports = {validateInformation}