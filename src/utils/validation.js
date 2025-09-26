const validator = require("validator");

const validateSignUpData = (req) => {
    const {firstName, lastName, email, password} = req.body;
    if (!firstName || firstName.length < 4 || firstName.length > 30) {
        throw new Error("Name is not valid");
    }
    else if(validator.isStrongPassword(password) === false) {
        throw new Error("Password is not strong enough");
    }
   
}

module.exports = { validateSignUpData };
