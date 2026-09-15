const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

mongoose.connect('mongodb://127.0.0.1:27017/vinfast').then(async () => {
  const hash = await bcrypt.hash('admin123', 10);
  await mongoose.connection.db.collection('users').updateOne(
    { email: 'admin@gmail.com' },
    { $set: { password: hash, isEmailConfirmed: true } }
  );
  console.log('DONE! Password reset to: admin123');
  mongoose.disconnect();
});
