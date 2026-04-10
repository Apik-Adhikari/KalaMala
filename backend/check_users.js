const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');
dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    const users = await User.find({}).select('username email role');
    console.log('Current User Roles:');
    console.table(users.map(u => ({ username: u.username, email: u.email, role: u.role })));
    process.exit();
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
