const User = require('../model/schemas/User')
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


const handleLogin = async (req, res) => {
  const cookies = req.cookies;
  console.log(`cookie available at login: ${JSON.stringify(cookies)}`);
  const { user, pwd } = req.body;
  if (!user || !pwd)
    return res
      .status(400)
      .json({ message: "Username and Password are required" });

  const foundUser = await User.findOne({username: user}).exec();

  if (!foundUser) return res.sendStatus(401); //unauthorized

  //evaluate password
  const match = await bcrypt.compare(pwd, foundUser.password);
  if (match) {
    const roles = Object.values(foundUser.roles).filter(Boolean);
    console.log(roles)
    // create JWTs
    const accessToken = jwt.sign(
      {
        UserInfo: {
          username: foundUser.username,
          roles: roles,
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "10s" }
    );
    const newrefreshToken = jwt.sign(
      { username: foundUser.username },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "20s" }
    );

    let newRefreshTokenArray = 
      !cookies?.jwt
        ? foundUser.refreshToken
        : foundUser.refreshToken.filter(rt => rt!==cookies.jwt);
        if (cookies?.jwt) {

          /* 
          Scenario added here: 
              1) User logs in but never uses RT and does not logout 
              2) RT is stolen
              3) If 1 & 2, reuse detection is needed to clear all RTs when user logs in
          */
          const refreshToken = cookies.jwt;
          const foundToken = await User.findOne({ refreshToken }).exec();

          // Detected refresh token reuse!
          if (!foundToken) {
              console.log('attempted refresh token reuse at login!')
              // clear out ALL previous refresh tokens
              newRefreshTokenArray = [];
          }

          res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true });
      }



    //Saving refreshToken with current user
    foundUser.refreshToken = [...newRefreshTokenArray, newrefreshToken];
    const result = foundUser.save();
    console.log(result);


    // creates secure cookie with refresh token
    res.cookie("jwt", newrefreshToken, {
      httpOnly: true,
      sameSite: "None",
      secure: true,  //(Thunder client error) required in production
      maxAge: 24 * 60 * 60 * 1000,
    });

    // send authorization roles and acess token to user
    res.json({ accessToken, roles });
  } else {
    res.sendStatus(401);
  }
};

module.exports = { handleLogin };
