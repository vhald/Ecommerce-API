const router = require('express').Router();
const User = require('../models/User');
const CryptoJS = require('crypto-js');
const jwt = require('jsonwebtoken');


// REGISTER
router.post("/register", async (req, res) => {
    const newUser = new User({
        username: req.body.username,
        email: req.body.email,
        // password: req.body.password,
        password: CryptoJS.AES.encrypt(req.body.password, process.env.PASS_SEC).toString(),
    });

    // save this user in our db
    // the db will take some time to save it.
    try {
        const savedUser = await newUser.save();
        // console.log(savedUser);
        res.status(201).json(savedUser);
    } catch (err) {
        res.status(500).json(err);
        // console.log(err);
    }

});

// LOGIN

router.post('/login', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.body.username });
        !user && res.status(401).json("Wrong username!");

        const hashedPassword = CryptoJS.AES.decrypt(
            user.password,
            process.env.PASS_SEC
        );
        const MainPassword = hashedPassword.toString(CryptoJS.enc.Utf8);

        // wrong password
        MainPassword !== req.body.password && res.status(401).json("Wrong password!");

        const accessToken = jwt.sign({
            id: user._id,
            isAdmin: user.isAdmin,
        },
            process.env.JWT_SEC,
            { expiresIn: "3d" }
        );


        // but we don't want to show the password, not even the encrypted one
        // db save our infos in the _doc but,i think in latest versions they rectified it. only using "user" should also works.
        const { password, ...others } = user._doc;

        res.status(200).json({ ...others, accessToken });

    } catch (err) {
        res.status(500).json(err);
    }
})


module.exports = router;
