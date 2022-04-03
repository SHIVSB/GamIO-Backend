const jwt = require("jsonwebtoken");
const User = require("../models/user/user");

const generateToken = (id) => {
    return jwt.sign({ id: id }, process.env.JWT_KEY, { expiresIn: "10d" });
};

const authMiddleware = async(req, res, next) => {
    let token;

    if(req.headers.authorization.startsWith('Bearer')){
        // console.log(req.headers.authorization)
        try {
            token = req.headers.authorization.split(" ")[1];
            if(token){
                const decoded = jwt.verify(token, process.env.JWT_KEY);
                //find the user by id
                const user = await User.findById(decoded.id).select('-password');
                //attach the user to req
                req.user = user
                next();
            }
        }catch(error){
            res.status(500).send("User not authorized")
        }
    }else{
        console.log("No authorization token");

        return res.status(500).send("No authorization token detected");
    }
}

module.exports = {generateToken, authMiddleware};
