const validator = require("validator");

const validateSignUpData = (req) => {
    const { firstName, lastName, email, password } = req.body;
    if (!firstName || firstName.length < 4 || firstName.length > 30) {
        throw new Error("Name is not valid");
    }
    else if (validator.isStrongPassword(password) === false) {
        throw new Error("Password is not strong enough");
    }

}

const validateProfileEditData = function (req) {
    const editableData = ["firstName", "lastName", "age", "photoUrl", "about", "skills", "gender"];
    let a=true;
    Object.keys(req.body).forEach(key => {
        if (!editableData.includes(key)) {
           a=false;
           return ;
        }
    });
    return a;
   
}


module.exports = { validateSignUpData, validateProfileEditData };
