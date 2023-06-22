const User = require('../model/schemas/User')

const handleLogout = async (req,res) => {
    //On client also delete the acessToken

    const cookies = req.cookies;
    if(!cookies?.jwt) return res.sendStatus(204); //no content
    const refreshToken = cookies.jwt;

    //Is refreshToken in db?
    const foundUser = await User.findOne({refreshToken}).exec();

    if(!foundUser) {
        res.clearCookie('jwt', {httpOnly: true, sameSite: 'None', secure: true });
        return res.sendStatus(403);
    }

    //Delete refreshToken in db
    foundUser.refreshToken = foundUser.refreshToken.filter(rr=> rr!==refreshToken);
    const result = await foundUser.save();
    console.log(result);
    
    res.clearCookie('jwt', {httpOnly: 'true', sameSite: 'None', secure: true}) //secure: true - only serves on https
    res.sendStatus(204);
}


module.exports = { handleLogout };