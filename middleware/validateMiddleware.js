const jsonwebtoken = require('jsonwebtoken')
const validateUpdateRequest = (req, res, next) => {
    let user = {
        name: req.body.name,
        age: req.body.age,
        gender: req.body.gender
    };
    if (user.name.length < 2) {
        res.status(400).json({ message: 'Name invalid' })
    }
    else if (user.age < 0 || user.age > 120) {
        res.status(400).json({ message: 'Age invalid' })
    }
    else if (user.gender != 1 && user.gender != 0) {
        res.status(400).json({ message: 'Gender invalid' })
    }
    else {
        next();
    }
}
const checkAdmin = (req, res, next) => {
    const jwt = req.headers.authorization.substring(7);
    jsonwebtoken.verify(jwt, process.env.JWT_SECRET, (err, admin) => {
        if (err) {
            res.status(403).json({ message: "Token is not valid!" });
        }
        else if (admin.isAdmin == 1) {
            const adminID = admin.id;
            req.adminID = adminID;
            next();
        }
    })
}
const checkUser = (req, res, next) => {
    const jwt = req.headers.authorization.substring(7);
    jsonwebtoken.verify(jwt, process.env.JWT_SECRET, async (err, user) => {
        if (err)
            return res.status(403).json({ message: "Token is not valid!" });
        req.user = user;
        next();
    })

}
const validateRegisterRequest = (req, res, next) => {
    user = {
        username: req.body.username,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        email: req.body.email,
        gender: req.body.gender,
        name: req.body.name,
        age: parseInt(req.body.age),
    }
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/
    if (user.age <= 0) {
        res.status(400).json({ message: 'age not valid' })
    }
    else if (user.username.length <= 3 || user.password.length <= 3) {
        res.status(400).json({ message: 'username or password not valid' })
    }
    else if (user.password !== user.confirmPassword) {
        res.status(400).json({ message: '2 password not same' })
    }
    else if (!emailRegex.test(user.email)) {
        res.status(400).json({ message: 'email not valid' })
    }
    else if (user.name.length < 2) {
        res.status(400).json({ message: 'name not valid' })
    }
    else {
        next();
    }

}
const validateLoginRequest = (req, res, next) => {
    let user = {
        username: req.body.username,
        password: req.body.password,
    };
    if (user.username.length <= 3) {
        res.status(400).json({ message: 'username not valid' })
    }
    else if (user.password.length <= 3) {
        res.status(400).json({ message: 'password not valid' })
    }
    else {
        next();
    }
}
const validateSearch = (req, res, next) => {
    let pageNumber = req.body.pageNumber;
    let pageSize = req.body.pageSize;
    if (pageNumber <= 0)
        res.status(400).json({ message: 'Page number have to >0' })
    else if (pageSize <= 0)
        res.status(400).json({ message: 'Pagesize have to >0' })
    else
        next();
}
module.exports = {
    validateLoginRequest,
    validateRegisterRequest,
    validateUpdateRequest,
    checkAdmin,
    checkUser,
    validateSearch
}