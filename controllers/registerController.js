const User = require("../model/schemas/User");
const bcrypt = require("bcrypt");

const handleNewUser = async (req, res) => {
  const { user, pwd } = req.body;
  if (!user || !pwd)
    return res
      .status(400)
      .json({ message: "Username and Password are required" });
  //check for duplicate username in the db

  const duplicate = await User.findOne({ username: user }).exec();
  //checking for duplicate
  if (duplicate) return res.sendStatus(409); //conflict
  try {
    // encrypting the password
    const hashedPwd = await bcrypt.hash(pwd, 10);
   
    // create and store the new user
    const result = await User.create({
      username: user,
      password: hashedPwd
    });

    console.log(result);

    res.status(201).json({ success: `New user ${user} created!` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { handleNewUser };
