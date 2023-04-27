const crypto = require('crypto');
function hashPassword(password){
    const salt = crypto.randomBytes(16).toString('hex');
    let hashedPassword =  crypto.pbkdf2Sync(
        password,
        salt,
        1000,
        64,
        'sha512'
    ).toString('hex');
    return{
        hashedPassword,salt
    }
};
// Dùng để kiểm tra password khi đăng nhập
function comparePassword(hashedPassword,salt,plainPassword){
    const passWord=  crypto.pbkdf2Sync(
        plainPassword,
        salt,
        1000,
        64,
        'sha512'
    ).toString('hex');
   if(passWord!=hashedPassword){
    return false;
   }
   return true;
}
module.exports={
    hashPassword,
    comparePassword
}