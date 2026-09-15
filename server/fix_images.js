const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/vinfast').then(async () => {
  const db = mongoose.connection.db;
  
  // Fix car color images
  const cars = await db.collection('cars').find({}).toArray();
  let fixedCount = 0;
  
  for (const car of cars) {
    let updated = false;
    
    if (car.colors) {
      for (const color of car.colors) {
        if (color.images) {
          color.images = color.images.map(img => {
            if (img && img.includes('localhost:5000/uploads/')) {
              updated = true;
              fixedCount++;
              return img.replace(/https?:\/\/localhost:5000/g, '');
            }
            return img;
          });
        }
      }
    }
    
    if (updated) {
      await db.collection('cars').updateOne(
        { _id: car._id },
        { $set: { colors: car.colors } }
      );
      console.log(`Fixed: ${car.name}`);
    }
  }
  
  console.log(`\nDone! Fixed ${fixedCount} image URLs.`);
  mongoose.disconnect();
});
