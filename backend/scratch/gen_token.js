const jwt = require('jsonwebtoken');
require('dotenv').config();

const user = {
    id: 'f3f8af32-67e0-4a85-bff1-d378e22b3d58',
    email: 'mayur@example.com',
    role: 'PATIENT'
};

const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role }, 
    process.env.JWT_SECRET, 
    { expiresIn: '1h' }
);

console.log(token);
