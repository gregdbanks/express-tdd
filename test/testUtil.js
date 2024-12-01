const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../index');
const User = require('../models/User');

function authRequest(userPayload = {}) {
    const token = jwt.sign(userPayload, process.env.JWT_SECRET || 'your_default_jwt_secret', {
        expiresIn: '1h',
    });

    const methods = ['get', 'post', 'put', 'delete', 'patch'];
    const authReq = {};

    methods.forEach(method => {
        authReq[method] = (url) => {
            return request(app)[method](url).set('Authorization', `Bearer ${token}`);
        };
    });

    return authReq;
}

async function setupAuthenticatedUser(userOptions = { name: 'Test User', email: 'test@example.com', password: 'password123', role: 'user' }) {
    let user = await User.findOne({ email: userOptions.email });

    if (!user) {
        user = await User.create({
            name: userOptions.name,
            email: userOptions.email,
            password: userOptions.password,
            role: userOptions.role
        });
    }

    const authReq = authRequest({ id: user._id });

    return { user, authReq };
}

module.exports = { authRequest, setupAuthenticatedUser };