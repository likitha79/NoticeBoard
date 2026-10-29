const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Notice = require('../models/Notice');
const User = require('../models/User');

dotenv.config();

// Helper date generator for realistic seed dates
const now = new Date();
const inDays = (d) => new Date(now.getTime() + d * 24 * 60 * 60 * 1000);
const daysAgo = (d) => new Date(now.getTime() - d * 24 * 60 * 60 * 1000);

const sampleNotices = [
  {
    title: 'B.Tech Regular & Supplementary Autonomous Examination Notification - Nov/Dec 2026',
    description: `All B.Tech (PVP14, PVP19, PVP20 Regulations) and M.Tech / MBA students of PVPSIT are informed that the Autonomous Semester End Examinations (Theory & Labs) for the Autumn 2026 session are scheduled to commence from November 10, 2026.\n\nKey Guidelines for Examinees:\n1. Detailed time-tables and seating arrangements are published on the examination cell notice board and student portal.\n2. Examination hall tickets will be issued starting November 3, 2026 to students who have cleared all dues and attained a minimum 75% attendance.\n3. Mandatory requirements: Printed Hall Ticket and College Student ID Card.\n4. Electronic gadgets, smartphones, programmable calculators, and smart watches are strictly prohibited inside the examination halls.\n\nFor fee payment dates and datesheet clarifications, contact the Autonomous Examination Section (Room 102).`,
    scope: 'College-wide',
    department: 'All',
    category: 'Examinations',
    author: 'Controller of Examinations, PVPSIT',
    isImportant: true,
    expiresAt: inDays(30), // Active, expires in 30 days
  },
  {
    title: 'Mega Campus Recruitment Drive 2026-27 – TCS, Cognizant & Tech Mahindra',
    description: `The Training & Placement Cell of PVPSIT is conducting a Mega Joint Campus Placement Drive for all eligible 2026-27 passing out batch students.\n\nParticipating Companies & CTC:\n- TCS (Digital & Ninja profiles: ₹3.6 - ₹7.2 LPA)\n- Cognizant (GenC Elevate & Pro: ₹4.5 - ₹6.5 LPA)\n- Tech Mahindra & Hexaware Technologies\n\nEligibility:\n- B.Tech (CSE, CSE-AI&ML, CSE-DS, IT, ECE, EEE, Mechanical, Civil)\n- Minimum 6.5 CGPA with no standing backlogs.\n\nOnline aptitude and coding rounds begin on October 12, 2026 in the Central Computer Laboratories (Lab 1 to 5). Pre-placement talks will be hosted in the Main Ground Floor Auditorium at 09:30 AM.`,
    scope: 'College-wide',
    department: 'All',
    category: 'Placements',
    author: 'Training & Placement Cell, PVPSIT',
    isImportant: true,
    expiresAt: inDays(14), // Active, expires in 14 days
  },
  {
    title: 'Tuition Fee & Autonomous Examination Fee Payment Notification for 2026-27',
    description: `All undergraduate and postgraduate students are hereby notified that the second installment of College Tuition Fees and Autumn 2026 Examination Fees must be remitted on or before October 25, 2026.\n\nPayment Methods:\n1. Online payment through the official PVPSIT SBI Collect / HDFC College ERP Portal.\n2. Bank challan at the College Accounts Counter (Ground Floor, Admin Block).\n\nPlease quote your Roll Number and Branch in the payment reference. Late payment fine of ₹500 will apply after the stipulated due date.`,
    scope: 'College-wide',
    department: 'All',
    category: 'Fees',
    author: 'Accounts & Administrative Officer, PVPSIT',
    isImportant: false,
    expiresAt: inDays(20), // Active
  },
  {
    title: 'JVD & AICTE Pragati / Saksham Merit Scholarship Application & Renewal Notice',
    description: `Applications and biometric verification are invited for the academic session 2026-27 from eligible students for government and institutional scholarship schemes.\n\nEligible Schemes:\n- Jagananna Vidya Deevena (JVD) & Vasathi Deevena\n- AICTE Pragati Scholarship for Girl Students\n- AICTE Saksham & Post-Matric National Scholarship Schemes\n\nRequired Documents:\n1. Latest Income Certificate issued by Tahsildar (after April 2026).\n2. Integrated Caste / Community Certificate.\n3. Previous year semester grade sheets & college fee receipts.\n4. Aadhaar-seeded bank passbook copy with IFSC.\n\nSubmit physical sets at the Scholarship Desk (Room 108) by October 30, 2026.`,
    scope: 'College-wide',
    department: 'All',
    category: 'Scholarships',
    author: 'Dean, Student Welfare & Scholarships',
    isImportant: true,
    expiresAt: inDays(25), // Active
  },
  {
    title: 'Circular: Anti-Ragging Committee Meeting & Mandatory Code of Conduct Guidelines',
    description: `In compliance with AICTE/UGC regulations and Supreme Court directives, PVPSIT strictly enforces a zero-tolerance policy against ragging in any form on campus, in college buses, and student hostels.\n\nAll students are required to submit their online Anti-Ragging Undertaking at www.antiragging.in and submit the reference receipt to their respective class mentors by October 15, 2026.\n\n24x7 Anti-Ragging Helpline numbers and Squad members list are displayed on all department notice boards.`,
    scope: 'College-wide',
    department: 'All',
    category: 'Circulars',
    author: 'Chairman, Anti-Ragging Committee & Principal',
    isImportant: false,
    expiresAt: null, // Indefinite, always active
  },
  {
    title: 'AICTE Sponsored One-Week National Level FDP on Emerging Technologies',
    description: `The Internal Quality Assurance Cell (IQAC) of PVPSIT is organizing an AICTE sponsored National Faculty Development Programme on "Artificial Intelligence, Cloud Computing & Cyber Threat Defense" from November 15 to November 20, 2026.\n\nDistinguished resource persons from IIT Hyderabad, NIT Warangal, and Microsoft will deliver expert lectures and hands-on lab sessions.\n\nFaculty members and research scholars can register through the IQAC portal on or before November 5, 2026. Certificates will be awarded upon qualifying the exit assessment.`,
    scope: 'College-wide',
    department: 'All',
    category: 'Workshops & FDPs',
    author: 'IQAC Coordinator & Dean R&D',
    isImportant: false,
    expiresAt: inDays(45), // Active
  },
  {
    title: '27th Annual College Day & Cultural Fest "SIDDHARTHA UTSAV 2026"',
    description: `Siddhartha Academy of General & Technical Education is delighted to announce the Annual Inter-Collegiate Cultural and Literary Festival "SIDDHARTHA UTSAV 2026" on December 18 & 19, 2026.\n\nEvents include Classical & Western Dance, Battle of the Bands, Fine Arts, Short Film Making, Street Plays, and Celebrity Musical Night!\n\nAudition registrations are open at the Student Activity Center (SAC). Exciting rolling trophies and cash awards await the winning teams.`,
    scope: 'College-wide',
    department: 'All',
    category: 'Events',
    author: 'Student Activity Council & Cultural Secretary',
    isImportant: false,
    expiresAt: inDays(60), // Active
  },
  {
    title: 'Official Holiday Notification: Vijayadasami & Dussehra Vacation 2026',
    description: `All students and staff members of PVPSIT are informed that the Institute will remain closed for Dussehra vacation from October 19 to October 24, 2026.\n\nRegular instructional classes, lab sessions, and administrative offices will resume functioning at 09:00 AM on Monday, October 26, 2026.\n\nHostel residents are requested to submit leave slips to the Chief Warden before departing.`,
    scope: 'College-wide',
    department: 'All',
    category: 'General',
    author: 'Office of the Principal, PVPSIT',
    isImportant: false,
    expiresAt: daysAgo(2), // Expired 2 days ago (visible in admin dashboard only)
  },
  {
    title: 'One-Week Hands-on Workshop on Generative AI, LLMs & Full-Stack Deployment (CSE Dept)',
    description: `The Department of Computer Science & Engineering is organizing an intensive 5-day certified skill workshop on "Modern Full-Stack Engineering with LangChain, Next.js & Cloud DevOps" from October 14 to October 18, 2026.\n\nVenue: CSE Advanced Software Computing Labs (Lab 4 & Lab 5)\nKey Takeaways: Building AI microservices, React full-stack integrations, Docker containers, and AWS CI/CD pipelines.\n\nTarget Audience: 3rd and 4th Year CSE Students. Certificate of Completion will be issued jointly with industry partners.`,
    scope: 'Department',
    department: 'CSE',
    category: 'Workshops & FDPs',
    author: 'HOD, Computer Science & Engineering',
    isImportant: true,
    expiresAt: inDays(10), // Active CSE
  },
  {
    title: 'TECHNOVISTA 2026: National Student Technical Fest & Algorithmic Hackathon (CSE Dept)',
    description: `CSE Department announces the annual flagship technical fest TECHNOVISTA 2026 on October 25, 2026.\n\nCompetitive Tracks:\n- Code-A-Thon (3-Hour Data Structures & Algorithm Coding Battle on HackerRank)\n- Technical Paper Presentation (Edge AI, Web3, Cyber Defense)\n- Web Design Sprint & UI/UX Challenge\n- Technical Quiz & Bug Bounty Hunt\n\nTotal cash prize pool of ₹50,000! Register at the CSE Department Desk or through the college intranet.`,
    scope: 'Department',
    department: 'CSE',
    category: 'Student Activities',
    author: 'Department of CSE, PVPSIT',
    isImportant: false,
    expiresAt: inDays(15), // Active CSE
  },
  {
    title: 'Cadence VLSI EDA Tools Training & IoT Embedded System Design Lab Schedule (ECE Dept)',
    description: `All 3rd and 4th year ECE students are hereby instructed that the hands-on training sessions on Cadence Virtuoso EDA software and Embedded ARM Cortex IoT controllers will be conducted in the ECE Simulation Lab from October 20 to October 23, 2026.\n\nStudents must complete the pre-lab simulation assignments and submit their Mini-Project Phase-1 progress reports to their internal faculty guides.`,
    scope: 'Department',
    department: 'ECE',
    category: 'Academics',
    author: 'HOD, Electronics & Communication Engineering',
    isImportant: false,
    expiresAt: inDays(12), // Active ECE
  },
  {
    title: 'Internal Smart India Hackathon (SIH 2026) Ideation Shortlisting (IT Dept)',
    description: `The Department of Information Technology invites team proposals for the Internal College Hackathon round of Smart India Hackathon (SIH 2026).\n\nProblem Themes: Smart Education, Healthcare Automation, Clean Energy, Disaster Management, and Agriculture IoT.\n\nTeams of 6 members (with at least 1 female member as per SIH guidelines) must submit their idea PPT and architecture diagram by October 22, 2026 to the IT Department SPOC.`,
    scope: 'Department',
    department: 'IT',
    category: 'Student Activities',
    author: 'HOD, Information Technology',
    isImportant: true,
    expiresAt: inDays(8), // Active IT
  },
  {
    title: 'Industrial Field Visit to National Auto Precision Cluster & CAD/CAM Lab (Mechanical Dept)',
    description: `The Department of Mechanical Engineering has arranged an industrial field study visit for 3rd year students to the Advanced CNC Machining & Robotics Plant on October 24, 2026.\n\nBuses will depart from the campus gate at 08:00 AM sharp. Students must wear industrial safety footwear, mechanical lab coats, and display identity cards throughout the plant tour.`,
    scope: 'Department',
    department: 'Mechanical',
    category: 'Academics',
    author: 'HOD, Mechanical Engineering',
    isImportant: false,
    expiresAt: inDays(18), // Active Mechanical
  },
];

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/college_notice_board';
    await mongoose.connect(mongoUri);
    console.log(`Connected to MongoDB at ${mongoUri}`);

    await Notice.deleteMany({});
    await User.deleteMany({});
    console.log('Cleared existing Notices and Users.');

    // 1. Create Default Administrator
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@pvpsit.ac.in').toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    const admin = await User.create({
      name: 'PVPSIT Chief Administrator',
      email: adminEmail,
      password: adminPassword,
      role: 'admin',
      department: 'All',
    });
    console.log(`✅ Default Admin created: ${admin.email} (Password: ${adminPassword})`);

    // 2. Create Sample Students
    const student1 = await User.create({
      name: 'Rahul Varma',
      email: 'rahul.cse@pvpsit.ac.in',
      password: 'student123',
      role: 'student',
      department: 'CSE',
      studentId: '21VR1A0542',
    });
    console.log(`✅ Sample CSE Student: ${student1.email} (Dept: CSE, Roll: ${student1.studentId})`);

    const student2 = await User.create({
      name: 'Sneha Reddy',
      email: 'sneha.ece@pvpsit.ac.in',
      password: 'student123',
      role: 'student',
      department: 'ECE',
      studentId: '21VR1A0418',
    });
    console.log(`✅ Sample ECE Student: ${student2.email} (Dept: ECE, Roll: ${student2.studentId})`);

    const student3 = await User.create({
      name: 'Ananya Sharma',
      email: 'ananya.it@pvpsit.ac.in',
      password: 'student123',
      role: 'student',
      department: 'IT',
      studentId: '21VR1A1205',
    });
    console.log(`✅ Sample IT Student: ${student3.email} (Dept: IT, Roll: ${student3.studentId})`);

    // 3. Create Sample Notices
    const notices = await Notice.insertMany(sampleNotices);
    console.log(`✅ Successfully seeded ${notices.length} realistic PVPSIT notices!`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
