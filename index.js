const express = require('express');

const app = express();

const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const User = require('./user');

app.use(bodyParser.json());

mongoose.connect('mongodb://tejaswini:tejaswini123@ds237357.mlab.com:37357/tejaswini-expressapp', { useNewUrlParser: true }, () => {
    console.log('Database connected');
});

app.get('/users', async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (err) {
        res.json({ message: err });
    }
});

app.post('/signup', (req, res, next) => {
    User.find({ email: req.body.email })
        .exec()
        .then(user => {
            if (user.length >= 1) {
                return res.status(409).json({
                    message: 'Mail exists'
                });
            } else {
                const user = new User({
                    _id: new mongoose.Types.ObjectId,
                    name: req.body.name,
                    email: req.body.email,
                    password: req.body.password
                });
                try {
                    user.save();
                    res.json(user);
                } catch (err) {
                    res.json({ message: err });
                }
            }
        })

});

app.post('/login', (req, res, next) => {
    User.find({ email: req.body.email })
        .exec()
        .then(user => {
            if (user.length < 1) {
                return res.status(401).json({
                    message: 'Authentication failed..Mail does\'nt exist'
                });
            }
            if (req.body.password == user[0].password) {
                const token = jwt.sign(
                    {
                        email: user[0].email,
                        userId: user[0]._id
                    },
                    "secret",
                    (err, token) => {
                        if (err) {
                            console.log(err)
                        }
                        else {
                            // console.log("\ntoken: \n" + token)

                            res.status(200).json({
                                message: 'Authentication successful',
                                token: token,
                                // newPassword : user[0].password
                            });
                            user[0].password = req.body.newPassword;
                            user[0].save()
                        }
                    }
                );
            } else {
                res.status(401).json({
                    message: 'Authentication failed..Wrong password'
                });
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        })
});

app.post('/reset', (req, res, next) => {
    User.find({ email: req.body.email })
        .exec()
        .then(user => {
            if (user.length < 1) {
                return res.status(401).json({
                    message: "Authentication failed..Mail does'nt exist"
                });
            }
            if (req.body.password == user[0].password) {
                const token = jwt.sign(
                    {
                        email: user[0].email,
                        userId: user[0]._id
                    },
                    "secret",
                    (err, token) => {
                        if (err) {
                            console.log(err)
                        }
                        else {
                            // console.log("\ntoken: \n" + token)
                            user[0].password = req.body.newPassword
                            user[0].save()
                            res.status(200).json({
                                message: 'Authentication successful..Password changed'
                            });
                        }
                    }
                );

            } else {
                res.status(401).json({
                    message: 'Authentication failed..Wrong password'
                });
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        })
});

app.post('/forgot', (req, res, next) => {
    User.find({ email: req.body.email })
        .exec()
        .then(user => {
            if (user.length < 1) {
                return res.status(401).json({
                    message: "Mail does'nt exist"
                });
            }
            else {
                let transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: 'tejach956@gmail.com',
                        pass: 'chinna1974'
                    }
                });
                let mailOptions = {
                    from: '"Tejaswini" <tejach956@gmail.com>',
                    to: req.body.email,
                    subject: "Reset Password",
                    text: "otp-'chinnu'",
                    html: "<b>otp-'chinnu'</b>"
                }
                transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        console.log(error);
                    } else {
                        console.log('Email sent: ' + info.response);
                        res.status(200).json({
                            message: 'An email has been sent'
                        });
                        res.redirect('/forgotpassword');
                    }
                });
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        })
});

app.post('/forgotpassword', (req, res, next) => {
    User.find({ email: req.body.email })
        .exec()
        .then(user => {
            if (user.length < 1) {
                return res.status(401).json({
                    message: 'Mail does\'nt exist'
                });
            }
            if (req.body.otp == 'chinnu') {
                if (req.body.newPassword == req.body.confirmPassword) {
                    user[0].password = req.body.confirmPassword;
                    user[0].save()
                    res.status(200).json({
                        message: 'Password reset is successful'
                    });
                }
                else {
                    res.status(401).json({
                        message: 'Entered passwords are not matching'
                    });
                }
            } else {
                res.status(401).json({
                    message: 'Entered OTP is incorrect'
                });
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        })
});

app.delete('/users/:userId', async (req, res) => {
    try {
        const removedUser = await User.remove({ _id: req.params.userId });
        res.json(removedUser);
    } catch (err) {
        res.json({ message: err });
    }
});

app.listen(3000);