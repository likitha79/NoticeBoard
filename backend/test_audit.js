const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const app = require('./server');
const http = require('http');

let server;
let baseUrl;

async function request(path, options = {}) {
  const url = `${baseUrl}${path}`;
  const headers = options.headers || {};
  let body = options.body;

  if (body && typeof body === 'object' && !(body instanceof Buffer)) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(body);
  }

  const response = await fetch(url, {
    method: options.method || 'GET',
    headers,
    body,
  });

  const text = await response.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch (e) {
    json = null;
  }

  return {
    status: response.status,
    headers: response.headers,
    data: json,
    text,
  };
}

async function runAudit() {
  console.log('====================================================');
  console.log('🚀 STARTING COMPREHENSIVE BACKEND & REST API AUDIT');
  console.log('====================================================\n');

  // Start HTTP server on dynamic port
  const port = 5055;
  server = http.createServer(app);
  await new Promise((resolve) => server.listen(port, resolve));
  baseUrl = `http://localhost:${port}`;
  console.log(`[PASS] Test server listening at ${baseUrl}`);

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition, message) {
    totalTests++;
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passedTests++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      process.exitCode = 1;
    }
  }

  try {
    // 1. Root & Health Check
    console.log('\n--- 1. Root and Config Endpoints ---');
    const rootRes = await request('/');
    assert(rootRes.status === 200 && rootRes.data.success === true, 'Root / returns status 200');

    const configRes = await request('/api/config');
    assert(configRes.status === 200 && configRes.data.data.departments.includes('CSE'), 'Config /api/config returns departments');

    // 2. Authentication Flow: Student Registration
    console.log('\n--- 2. Authentication: Student Registration ---');
    const testStudentEmail = `audit_student_${Date.now()}@pvpsit.ac.in`;
    const regRes = await request('/api/auth/register', {
      method: 'POST',
      body: {
        name: 'Audit Student CSE',
        email: testStudentEmail,
        password: 'password123',
        department: 'CSE',
        studentId: '22VR1A0599',
      },
    });

    assert(regRes.status === 201 && regRes.data.success === true, 'Student registration returns 201 Created');
    assert(regRes.data.data.token && regRes.data.data.role === 'student', 'Student registration returns JWT token');
    const studentToken = regRes.data.data.token;

    // 2b. Duplicate Registration Rejection
    const dupRes = await request('/api/auth/register', {
      method: 'POST',
      body: {
        name: 'Audit Student Duplicate',
        email: testStudentEmail,
        password: 'password123',
        department: 'CSE',
        studentId: '22VR1A0599',
      },
    });
    assert(dupRes.status === 400 && dupRes.data.success === false, 'Duplicate email registration rejected with 400');

    // 3. Authentication: Student Login
    console.log('\n--- 3. Authentication: Student Login ---');
    const loginRes = await request('/api/auth/login', {
      method: 'POST',
      body: {
        email: testStudentEmail,
        password: 'password123',
      },
    });
    assert(loginRes.status === 200 && loginRes.data.success === true, 'Student login returns 200 OK');
    assert(loginRes.data.data.department === 'CSE', 'Student login payload includes department');

    // 3b. Invalid Password Rejection
    const badLoginRes = await request('/api/auth/login', {
      method: 'POST',
      body: {
        email: testStudentEmail,
        password: 'wrongpassword',
      },
    });
    assert(badLoginRes.status === 401 && badLoginRes.data.success === false, 'Bad password login returns 401 Unauthorized');

    // 4. Authentication: Admin Login
    console.log('\n--- 4. Authentication: Admin Login ---');
    const adminLoginRes = await request('/api/auth/login', {
      method: 'POST',
      body: {
        email: 'admin@pvpsit.ac.in',
        password: 'admin123',
      },
    });
    assert(adminLoginRes.status === 200 && adminLoginRes.data.data.role === 'admin', 'Admin login returns 200 OK with admin role');
    const adminToken = adminLoginRes.data.data.token;

    // 5. Protected Profile Verification
    console.log('\n--- 5. Protected Profile Verification ---');
    const profileRes = await request('/api/auth/profile', {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    assert(profileRes.status === 200 && profileRes.data.data.email === testStudentEmail, 'Profile endpoint returns user data for student');

    const unauthProfileRes = await request('/api/auth/profile');
    assert(unauthProfileRes.status === 401, 'Profile endpoint rejects unauthenticated request with 401');

    // 6. Department Notice Filtering Logic
    console.log('\n--- 6. Department Notice Filtering Logic ---');
    // As CSE student
    const studentNoticesRes = await request('/api/notices', {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    assert(studentNoticesRes.status === 200, 'Student notices fetch returns 200');
    const studentNotices = studentNoticesRes.data.data;
    
    const hasCollegeWide = studentNotices.some((n) => n.scope === 'College-wide');
    const hasCseNotice = studentNotices.some((n) => n.scope === 'Department' && n.department === 'CSE');
    const hasEceNotice = studentNotices.some((n) => n.scope === 'Department' && n.department === 'ECE');
    const hasMechNotice = studentNotices.some((n) => n.scope === 'Department' && n.department === 'Mechanical');

    assert(hasCollegeWide, 'CSE student receives College-wide notices');
    assert(hasCseNotice, 'CSE student receives CSE department notices');
    assert(!hasEceNotice, 'CSE student DOES NOT receive ECE department notices (Strict Isolation)');
    assert(!hasMechNotice, 'CSE student DOES NOT receive Mechanical department notices (Strict Isolation)');

    // 7. Authorization & Role Protection: Student denied Admin CRUD
    console.log('\n--- 7. Role-Based Authorization Enforcement ---');
    const studentPostRes = await request('/api/notices', {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` },
      body: {
        title: 'Hacked Notice by Student',
        description: 'This should be blocked',
        scope: 'College-wide',
        category: 'General',
        author: 'Student',
      },
    });
    assert(studentPostRes.status === 403, 'Student attempting POST /api/notices is DENIED (403 Forbidden)');

    const studentDeleteRes = await request(`/api/notices/${studentNotices[0]._id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    assert(studentDeleteRes.status === 403, 'Student attempting DELETE /api/notices/:id is DENIED (403 Forbidden)');

    // 8. Admin Notice CRUD Operations
    console.log('\n--- 8. Admin Notice CRUD Operations ---');
    // Create
    const createNoticeRes = await request('/api/notices', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        title: 'Audit Test Notice for CSE and IT',
        description: 'Detailed description for automated verification of database persistence.',
        scope: 'Department',
        department: 'CSE',
        category: 'Academics',
        author: 'HOD CSE & IQAC',
        isImportant: true,
      },
    });
    assert(createNoticeRes.status === 201 && createNoticeRes.data.success === true, 'Admin POST /api/notices creates notice (201 Created)');
    const createdNoticeId = createNoticeRes.data.data._id;

    // Read by ID
    const getNoticeRes = await request(`/api/notices/${createdNoticeId}`);
    assert(getNoticeRes.status === 200 && getNoticeRes.data.data.title === 'Audit Test Notice for CSE and IT', 'GET /api/notices/:id returns created notice');

    // Update
    const updateNoticeRes = await request(`/api/notices/${createdNoticeId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        title: 'Audit Test Notice for CSE and IT (UPDATED)',
        description: 'Updated description verifying database update capability.',
        isImportant: false,
      },
    });
    assert(updateNoticeRes.status === 200 && updateNoticeRes.data.data.title === 'Audit Test Notice for CSE and IT (UPDATED)', 'Admin PUT /api/notices/:id updates notice in MongoDB (200 OK)');

    // Verify Read after Update
    const getUpdatedRes = await request(`/api/notices/${createdNoticeId}`);
    assert(getUpdatedRes.data.data.title === 'Audit Test Notice for CSE and IT (UPDATED)' && getUpdatedRes.data.data.isImportant === false, 'GET confirms updated title and important flag in database');

    // Delete
    const deleteNoticeRes = await request(`/api/notices/${createdNoticeId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(deleteNoticeRes.status === 200 && deleteNoticeRes.data.success === true, 'Admin DELETE /api/notices/:id removes notice (200 OK)');

    // Verify Delete
    const getDeletedRes = await request(`/api/notices/${createdNoticeId}`);
    assert(getDeletedRes.status === 404, 'GET after DELETE returns 404 Not Found');

    // 9. Notice Expiry Validation & Filtering Logic
    console.log('\n--- 9. Notice Expiry Validation & Filtering Logic ---');
    
    // 9a. Rejection of expiry date in the past
    const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const badExpiryRes = await request('/api/notices', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        title: 'Expired Test Notice in Past',
        description: 'This notice should be rejected because expiry date is in past.',
        scope: 'College-wide',
        category: 'General',
        author: 'Admin',
        expiresAt: pastDate,
      },
    });
    assert(badExpiryRes.status === 400 && badExpiryRes.data.success === false, 'Notice creation with past expiry date rejected with 400');

    // 9b. Creation with future expiry date
    const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const futureNoticeRes = await request('/api/notices', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        title: 'Active Notice with Future Expiry',
        description: 'This notice is valid and active for next 7 days.',
        scope: 'College-wide',
        category: 'General',
        author: 'Admin',
        expiresAt: futureDate,
      },
    });
    assert(futureNoticeRes.status === 201 && futureNoticeRes.data.data.expiresAt !== null, 'Notice created with valid future expiry date (201)');
    const futureNoticeId = futureNoticeRes.data.data._id;

    // 9c. Directly create an expired notice in DB for filtering verification
    const NoticeModel = require('./models/Notice');
    const expiredDoc = await NoticeModel.create({
      title: 'Expired Legacy Notice for Test',
      description: 'This notice has expired yesterday.',
      scope: 'College-wide',
      category: 'General',
      author: 'Admin',
      expiresAt: new Date(Date.now() - 3600 * 1000), // 1 hour ago
    });
    const expiredNoticeId = expiredDoc._id.toString();

    // 9d. Student list notices - should NOT contain expired notice
    const studentCheckRes = await request('/api/notices', {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const studentListIds = studentCheckRes.data.data.map((n) => n._id.toString());
    assert(!studentListIds.includes(expiredNoticeId), 'Student GET /api/notices automatically excludes expired notices');
    assert(studentListIds.includes(futureNoticeId), 'Student GET /api/notices includes active notice with future expiry');

    // 9e. Guest list notices - should NOT contain expired notice
    const guestCheckRes = await request('/api/notices');
    const guestListIds = guestCheckRes.data.data.map((n) => n._id.toString());
    assert(!guestListIds.includes(expiredNoticeId), 'Guest / Unauthenticated GET /api/notices excludes expired notices');

    // 9f. Admin list notices - CAN see expired notices
    const adminCheckRes = await request('/api/notices', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const adminListIds = adminCheckRes.data.data.map((n) => n._id.toString());
    assert(adminListIds.includes(expiredNoticeId), 'Admin GET /api/notices includes expired notices for admin oversight');

    // 9g. Direct ID fetch of expired notice
    const studentGetExpiredRes = await request(`/api/notices/${expiredNoticeId}`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    assert(studentGetExpiredRes.status === 404, 'Student direct GET /api/notices/:id on expired notice returns 404');

    const adminGetExpiredRes = await request(`/api/notices/${expiredNoticeId}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(adminGetExpiredRes.status === 200 && adminGetExpiredRes.data.data.title === 'Expired Legacy Notice for Test', 'Admin direct GET /api/notices/:id on expired notice returns 200');

    // Cleanup test docs
    await NoticeModel.findByIdAndDelete(futureNoticeId);
    await NoticeModel.findByIdAndDelete(expiredNoticeId);

    // 10. Admin Stats Summary
    console.log('\n--- 10. Admin Dashboard Metrics Endpoint ---');
    const statsRes = await request('/api/notices/stats/summary', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(statsRes.status === 200 && typeof statsRes.data.data.totalNotices === 'number' && typeof statsRes.data.data.expiredNotices === 'number', 'GET /api/notices/stats/summary returns metrics including active & expired counts');

    // Student denied stats
    const studentStatsRes = await request('/api/notices/stats/summary', {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    assert(studentStatsRes.status === 403, 'Student denied /api/notices/stats/summary with 403 Forbidden');

    console.log('\n====================================================');
    console.log(`AUDIT RESULTS: ${passedTests}/${totalTests} TESTS PASSED`);
    console.log('====================================================\n');
  } catch (error) {
    console.error('Audit encountered an unexpected exception:', error);
    process.exitCode = 1;
  } finally {
    if (server) {
      server.close();
    }
    await mongoose.disconnect();
    process.exit(process.exitCode || 0);
  }
}

runAudit();
