const User = require('./../models/userModel');
const jwt = require('jsonwebtoken');
const AppError = require('./../utils/appError');
const { promisify } = require('util');
const bcrypt = require('bcryptjs');
const axios = require('axios');

// Generate JWT token
const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};

// Create and send token in response
const createSendToken = (user, statusCode, res) => {
    const token = signToken(user.cid);
    const cookieOptions = {
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
    };
    res.cookie('jwt', token, cookieOptions);

    res.status(statusCode).json({
        status: "success",
        token,
        data: {
            user,
        },
    });
};

// Signup handler
exports.signup = async (req, res, next) => {
    try {
        const newUser = await User.create(req.body);
        createSendToken(newUser, 201, res);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Login handler
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return next(new AppError('Please provide an email and password!', 400));
        }

        const user = await User.findOne({ where: { email: email } });

        if (!user || !(await user.correctPassword(password))) {
            return next(new AppError('Incorrect email or password', 401));
        }

        createSendToken(user, 200, res);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Logout handler
exports.logout = (req, res) => {
    res.cookie('jwt', '', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true,
    });
    res.status(200).json({ status: 'success' });
};

// Protect routes middleware
exports.protect = async (req, res, next) => {
    try {
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        } else if (req.cookies.jwt) {
            token = req.cookies.jwt;
        }

        if (!token) {
            return next(
                new AppError('You are not logged in! Please log in to get access.', 401)
            );
        }

        const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

        // console.log(decoded)
        const freshUser = await User.findOne({ where: { cid: decoded.id } });
        if (!freshUser) {
            return next(
                new AppError('The user belonging to this token no longer exists', 401)
            );
        }

        req.user = freshUser;
        next();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update password handler
exports.updatePassword = async (req, res, next) => {
    try {
        const user = await User.findOne(req.user.id);

        if (!(await user.correctPassword(req.body.passwordCurrent))) {
            return next(new AppError('Your current password is incorrect', 401));
        }

        user.password = req.body.password;
        await user.save();

        createSendToken(user, 200, res);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Restrict access to certain roles
exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(
                new AppError('You do not have permission to perform this action', 403)
            );
        }
        next();
    };
};

// Login or Signup handler
exports.loginOrSignup = async (req, res) => {
    const { cid } = req.body;

    try {
        const proxyResponse = await axios.get(`http://ec2-54-169-102-101.ap-southeast-1.compute.amazonaws.com:8080/?cid=${cid}`);
        const proxyData = proxyResponse.data;

        if (proxyData.error) {
            return res.status(400).json({
                status: 'fail',
                message: 'Invalid CID or error fetching proxy data',
            });
        }

        const userData = {
            cid,
            name: `${proxyData.data.first_name} ${proxyData.data.last_name}`,
            email: proxyData.data.email,
            phonenumber: proxyData.data.phone,
            address: `${proxyData.data.dzongkhag}, ${proxyData.data.gewog}, ${proxyData.data.village}`,
            password: 'defaultPassword123',
        };

        let user = await User.findOne({ where: { cid: userData.cid } });

        if (user) {
            console.log('User exists, logging in:', user);
        } else {
            const hashedPassword = await bcrypt.hash(userData.password, 12);
            user = await User.create({
                ...userData,
                password: hashedPassword,
            });
            console.log('User signed up and logged in:', user);
        }

        createSendToken(user, 200, res);

    } catch (error) {
        console.error('Error during login or signup:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error during login or signup process',
        });
    }
};
