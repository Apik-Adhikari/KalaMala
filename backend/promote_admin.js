const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');
dotenv.config();

const email = 'rijanb98@gmail.com';

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    const user = await User.findOneAndUpdate({ email }, { role: 'admin' }, { new: true });
    if (user) {
      console.log(`Success: ${email} is now an admin.`);
    } else {
      console.log(`Error: User with email ${email} not found.`);
    }
    process.exit();
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
