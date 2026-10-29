const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Notice = require('./models/Notice');
const User = require('./models/User');

async function testPersistence() {
  console.log('====================================================');
  console.log('🔄 STARTING MONGODB REAL PERSISTENCE VERIFICATION');
  console.log('====================================================\n');

  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/college_notice_board';
  
  // Phase 1: Connect to MongoDB and create persistent record
  console.log('Phase 1: Connecting to MongoDB...');
  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB successfully.');

  const uniqueId = Date.now();
  const noticeTitle = `Persistence Test Notice ${uniqueId}`;
  
  console.log(`Phase 2: Creating new persistent notice "${noticeTitle}" in MongoDB...`);
  const createdNotice = await Notice.create({
    title: noticeTitle,
    description: 'This notice is written to verify physical database persistence across process termination.',
    scope: 'Department',
    department: 'CSE',
    category: 'Academics',
    author: 'Chief Academic Officer',
    isImportant: true,
  });

  console.log(`Notice created with MongoDB _id: ${createdNotice._id}`);

  // Phase 3: Simulate complete application shutdown & process termination
  console.log('\nPhase 3: Simulating full server shutdown and disconnecting MongoDB...');
  await mongoose.disconnect();
  console.log('Server process terminated. Connection closed.');

  // Wait 1 second
  await new Promise((r) => setTimeout(r, 1000));

  // Phase 4: Cold boot and reconnect to MongoDB
  console.log('\nPhase 4: Cold restart of backend application and reconnecting...');
  await mongoose.connect(mongoUri);
  console.log('Reconnected to MongoDB.');

  // Phase 5: Query for persisted notice
  console.log(`Phase 5: Querying database for notice _id: ${createdNotice._id}...`);
  const retrievedNotice = await Notice.findById(createdNotice._id);

  if (!retrievedNotice) {
    console.error('❌ PERSISTENCE FAILURE: Notice was lost after server restart!');
    process.exit(1);
  }

  console.log(`✅ PERSISTENCE CONFIRMED: Found notice "${retrievedNotice.title}" with matching ID!`);
  console.log(`   Scope: ${retrievedNotice.scope} | Department: ${retrievedNotice.department} | Important: ${retrievedNotice.isImportant}`);

  // Clean up test notice
  await Notice.deleteOne({ _id: createdNotice._id });
  console.log('Cleaned up test notice.');

  await mongoose.disconnect();
  console.log('\n====================================================');
  console.log('✅ ALL PERSISTENCE TESTS PASSED SUCCESSFULLY');
  console.log('====================================================\n');
}

testPersistence().catch((err) => {
  console.error('Persistence test failed:', err);
  process.exit(1);
});
