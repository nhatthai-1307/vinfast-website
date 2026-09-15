const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

mongoose.connect('mongodb://127.0.0.1:27017/vinfast').then(async () => {
  const hash = await bcrypt.hash('123456', 10);
  const result = await mongoose.connection.db.collection('users').updateOne(
    { email: 'nhatthai9764@gmail.com' },
    { $set: { password: hash, isEmailConfirmed: true } }
  );
  console.log('Matched:', result.matchedCount);
  console.log('DONE! Password reset to: 123456');
  mongoose.disconnect();
});
