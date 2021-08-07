
const express = require('express')
const router = express.Router();
const User = require('../models/User');
const config = require('../utils/config.json')
const ErrorResponse = require('../utils/errorResponse');
const sendEmail = require('../utils/email');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');


// Routes
// Register API
//method POST


router.post('/register', async (request, response, next) => {
     // #swagger.tags = ['Users']
    const { username, firstname, lastname, email, password } = request.body;
    try {


        const user = await User.create({
            username: username,
            password: password,
            email: email,
            firstName: firstname,
            lastName: lastname,



        });

        response.status(200).json({
            status: config.status_success,
            message: 'user created',
            data: {
                username,
                email
            }

        })

    } catch (error) {
        next(error);
    }



});

// login API
// method POST
router.post('/login', async (request, response, next) => {
     // #swagger.tags = ['Users']
      /* #swagger.responses[200] = {
                    description: 'User successfully obtained.',
            } */
    const { username, password } = request.body;
    if (!username || !password) {
        return next(new ErrorResponse('please provide valid username and password', 200));

    }
    try {
        //check if user exist
        var user = await User.findOne({ username });
        if (!user) {
            return next(new ErrorResponse('invalid username/or password', 200));
        }

        //checking if password is correct
        const isMatch = await user.checkpassword(password);
        if (isMatch === false) {
            return next(new ErrorResponse("invalid username/or password", 200));


        }
        //change the user mongose object to json and delete the password before using it in jwt
        var user = user.toObject()
        delete user.password;
        const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET); //, { expiresIn: '1d' }
        // implement the refresh token later
        response.json({
            status: config.status_success,
            message: `user ${username} logged in `,
            data: {
                accessToken: accessToken
            }

        })

    } catch (error) {
        next(error);
    }

});


//forgot password API
//method POST

router.post('/forgotpassword', async (request, response, next) => {
    const { email } = request.body;
    if (!email) {
        return next(new ErrorResponse('Email field is missing', 200));

    }
    try {
        const user = await User.findOne({ email })
        if (!user) {
            return next(new ErrorResponse("invalid email", 200));
        }

        const resetToken = await user.getPasswordResetToken();

        await user.save();

        const resetUrl = process.env.FRONT_DOMAIN + `/passwordReset/${resetToken}`;
        // console.log(resetUrl);

        const message = `
        <h>You have requested a password reset</h1>
        <p>Please go to this link to reset your password </p>
        <a href=${resetUrl} clicktracking=off>${resetUrl}</a>
        `
        try {
            await sendEmail({
                to: user.email,
                subject: 'passwordreset',
                text: message
            });
            response.send({
                'status': config.status_success,
                'message': 'Email Sent',
                'data': resetToken
            });
        } catch (error) {
            user.passwordResetToken = undefined;
            user.restPasswordExpire = undefined;

            await user.save();

            return next(new ErrorResponse("Email could not be sent", 500))

        }
    } catch (err) {
        next(err);
    }



});


//reset password API
// method POST

router.post('resetpassword/:resetToken', async (request, response, next) => {
    const restpasswordtoken = crypto.createHash("sha256").update(request.params.resetToken).digest("hex");

    try {
        const user = await User.findOne({
            passwordResetToken: restpasswordtoken,
            // restPasswordExpire: { $gt: Date.now() }  //$gt in mongodb means greter than so we say check if the time we have in the DB is greater than that number
        })
        if (!user) {
            return next(new ErrorResponse("invalid reset Token", 200));
        }
        if (!user.checkResetTokenExpire()) {
            return next(new ErrorResponse("reset token Expired", 200));
        }

        user.password = request.body.password;

        user.passwordResetToken = undefined;
        user.restPasswordExpire = undefined;
        await user.save();

        response.send({
            'status': config.status_success,
            'message': 'rest success'
        })
    } catch (err) {
        next(err);
    }

});





module.exports = router