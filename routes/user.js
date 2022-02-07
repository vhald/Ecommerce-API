const router = require('express').Router();
const User = require('../models/User');
const { verifyToken, verifyTokenAndAuthorization, verifyTokenAndAdmin } = require('./verifyToken')

// it opens on "lh:5000/api/user/usertest"
// router.get('/usertest', (req, res) => {
//     res.send("user test is successful");
// });


// router.post("/userposttest", (req, res) => {
//     const username = req.body.username
//     // that should prt the post req data in the console.
//     // console.log(username);

//     // this is the send method that should send the data in the postman
//     res.send("your username is: " + username)
// })

// UPDATE
router.put('/:id', verifyTokenAndAuthorization, async (req, res) => {
    if (req.body.password) {
        req.body.password = CryptoJS.AES.encrypt(
            req.body.password,
            process.env.PASS_SEC
        ).toString();
    }

    try {
        const updatedUser = await User.findByIdAndUpdate(req.params.id, {
            $set: req.body
        }, { new: true });
        res.status(200).json(updatedUser);

    } catch (err) {
        res.status(500).json(err);
    }
});


// DELETE

router.delete("/:id", verifyTokenAndAuthorization, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id)
        res.status(200).json("User has been deleted");
    } catch (err) {
        res.status(500).json(err);
    }
})

// GET USER

router.get("/find/:id", verifyTokenAndAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        const { password, ...others } = user._doc;

        res.status(200).json(others);
    } catch (err) {
        res.status(500).json(err);
    }
});

// GET ALL USERS

router.get("/", verifyTokenAndAdmin, async (req, res) => {
    // get only last added ids using query
    const query = req.query.new;
    try {
        const users = query
            ? await User.find().sort({ __id: -1 }).limit(2)
            : await User.find();
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json(err);
    }
});


// GET USER STATUS

router.get("/stats", verifyTokenAndAdmin, async (req, res) => {
    const date = new Date();
    const lastYear = new Date(date.setFullYear(date.getFullYear() - 1));

    try {
        const data = await User.aggregate([
            { $match: { createdAt: { $gte: lastYear } } },
            {
                $project: {
                    month: { $month: "$createdAt" },
                },
            },
            {
                $group: {
                    _id: "$month",
                    total: { $sum: 1 },
                }
            }
        ]);
        res.status(200).json(data);
    } catch (err) {
        res.status(500).json(err);
    }

})


module.exports = router