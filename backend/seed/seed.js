const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const AlumniProfile = require('../models/AlumniProfile');
const ConnectionRequest = require('../models/ConnectionRequest');
const MentorshipRequest = require('../models/MentorshipRequest');
const MentorshipSession = require('../models/MentorshipSession');
const Job = require('../models/Job');
const Event = require('../models/Event');
const EventRequest = require('../models/EventRequest');
const EventRegistration = require('../models/EventRegistration');
const Resource = require('../models/Resource');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Notification = require('../models/Notification');

dotenv.config();

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/alumniconnect';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing collections
    await User.deleteMany({});
    await StudentProfile.deleteMany({});
    await AlumniProfile.deleteMany({});
    await ConnectionRequest.deleteMany({});
    await MentorshipRequest.deleteMany({});
    await MentorshipSession.deleteMany({});
    await Job.deleteMany({});
    await Event.deleteMany({});
    await EventRequest.deleteMany({});
    await EventRegistration.deleteMany({});
    await Resource.deleteMany({});
    await Conversation.deleteMany({});
    await Message.deleteMany({});
    await Notification.deleteMany({});

    console.log('Cleared database collections.');

    // 1. Create Admin
    const adminUser = new User({
      name: 'System Admin',
      email: 'admin@alumniconnect.com',
      password: 'Admin@123',
      role: 'admin',
      isVerified: true
    });
    await adminUser.save();

    // 2. Create 5 Students (including main demo student)
    const studentData = [
      {
        name: 'Siddharth Chavan',
        email: 'student@alumniconnect.com', // DEMO STUDENT CREDENTIAL
        password: 'Student@123',
        role: 'student',
        isVerified: true,
        prn: '2425001002',
        department: 'CSBS',
        batch: '2026',
        skills: ['React', 'Node.js', 'MongoDB', 'JavaScript', 'Python'],
        interests: ['Web Development', 'AI/ML', 'Cloud Computing'],
        bio: 'Aspiring Full Stack Engineer passionate about building scalable web platforms and AI-driven solutions.'
      },
      {
        name: 'Tanmay Dhanukate',
        email: 'tanmay@alumniconnect.com',
        password: 'Student@123',
        role: 'student',
        isVerified: true,
        prn: '2425001098',
        department: 'CSBS',
        batch: '2026',
        skills: ['Python', 'Data Science', 'SQL', 'FastAPI'],
        interests: ['Data Analytics', 'Backend Engineering'],
        bio: 'Data Science enthusiast focused on data engineering and predictive modeling.'
      },
      {
        name: 'Abhishek Jambhale',
        email: 'abhishek@alumniconnect.com',
        password: 'Student@123',
        role: 'student',
        isVerified: true,
        prn: '2425001115',
        department: 'CSBS',
        batch: '2026',
        skills: ['Flutter', 'React Native', 'Firebase', 'UI/UX'],
        interests: ['Mobile App Development', 'Product Design'],
        bio: 'Mobile Application developer building smooth cross-platform applications.'
      },
      {
        name: 'Riya Patil',
        email: 'riya.patil@alumniconnect.com',
        password: 'Student@123',
        role: 'student',
        isVerified: true,
        prn: '2425001204',
        department: 'CSE',
        batch: '2025',
        skills: ['Java', 'Spring Boot', 'Microservices', 'Docker'],
        interests: ['Enterprise Systems', 'System Design'],
        bio: 'Senior CSE student interested in cloud microservices architecture.'
      },
      {
        name: 'Aarav Sharma',
        email: 'aarav.sharma@alumniconnect.com',
        password: 'Student@123',
        role: 'student',
        isVerified: true,
        prn: '2425001308',
        department: 'IT',
        batch: '2026',
        skills: ['Cybersecurity', 'Linux', 'Go', 'Networking'],
        interests: ['Ethical Hacking', 'DevOps'],
        bio: 'IT enthusiast diving deep into cloud security and infrastructure automation.'
      }
    ];

    const students = [];
    for (const s of studentData) {
      const u = new User({
        name: s.name,
        email: s.email,
        password: s.password,
        role: 'student',
        isVerified: true
      });
      await u.save();

      const sp = await StudentProfile.create({
        user: u._id,
        prn: s.prn,
        department: s.department,
        batch: s.batch,
        skills: s.skills,
        interests: s.interests,
        bio: s.bio,
        careerGoals: 'To secure a Software Engineer role at a top-tier technology company.',
        socialLinks: {
          linkedin: `https://linkedin.com/in/${s.name.toLowerCase().replace(/\s+/g, '')}`,
          github: `https://github.com/${s.name.toLowerCase().replace(/\s+/g, '')}`
        }
      });

      u.studentProfile = sp._id;
      await u.save();
      students.push(u);
    }

    // 3. Create 5 Alumni (including main demo alumni)
    const alumniData = [
      {
        name: 'Pranali Titvekar',
        email: 'alumni@alumniconnect.com', // DEMO ALUMNI CREDENTIAL
        password: 'Alumni@123',
        role: 'alumni',
        isVerified: true,
        graduationYear: 2022,
        department: 'CSBS',
        currentCompany: 'Google India',
        jobTitle: 'Senior Software Engineer',
        industry: 'Technology',
        location: 'Bengaluru, India',
        skills: ['System Design', 'React', 'Distributed Systems', 'Python', 'Kubernetes'],
        expertise: ['Career Guidance', 'Placement Prep', 'System Design', 'Tech Architecture'],
        bio: 'Senior Engineer at Google with 4+ years of industry experience. Passionate about mentoring students and guiding campus hires.'
      },
      {
        name: 'Rahul Deshmukh',
        email: 'rahul.d@alumniconnect.com',
        password: 'Alumni@123',
        role: 'alumni',
        isVerified: true,
        graduationYear: 2021,
        department: 'CSE',
        currentCompany: 'Microsoft',
        jobTitle: 'Cloud Solutions Architect',
        industry: 'Cloud Computing',
        location: 'Hyderabad, India',
        skills: ['Azure', 'C#', '.NET Core', 'DevOps', 'Terraform'],
        expertise: ['Higher Studies', 'Cloud Architecture', 'Interview Prep'],
        bio: 'Cloud Specialist at Microsoft. Alumni of KIT Kolhapur (CSE 2021).'
      },
      {
        name: 'Priya Kulkarni',
        email: 'priya.k@alumniconnect.com',
        password: 'Alumni@123',
        role: 'alumni',
        isVerified: true,
        graduationYear: 2023,
        department: 'IT',
        currentCompany: 'Amazon',
        jobTitle: 'Frontend Developer (SDE II)',
        industry: 'E-commerce / Tech',
        location: 'Pune, India',
        skills: ['React', 'TypeScript', 'Next.js', 'Redux', 'Web Performance'],
        expertise: ['Placement Prep', 'Frontend Development', 'Resume Reviews'],
        bio: 'Fullstack & Frontend Enthusiast working on Amazon Customer Experience.'
      },
      {
        name: 'Vikram Joshi',
        email: 'vikram.j@alumniconnect.com',
        password: 'Alumni@123',
        role: 'alumni',
        isVerified: true,
        graduationYear: 2020,
        department: 'Mechanical',
        currentCompany: 'Tesla Motors',
        jobTitle: 'Product Manager',
        industry: 'Automotive / Hardware',
        location: 'Mumbai, India',
        skills: ['Product Strategy', 'Agile Management', 'Hardware Analytics'],
        expertise: ['Entrepreneurship', 'Product Management', 'Higher Studies abroad'],
        bio: 'Transitioned from engineering to Product Management. MS from Carnegie Mellon.'
      },
      {
        name: 'Neha Mehta',
        email: 'neha.m@alumniconnect.com',
        password: 'Alumni@123',
        role: 'alumni',
        isVerified: false, // Unverified for admin verification testing
        graduationYear: 2024,
        department: 'CSBS',
        currentCompany: 'Goldman Sachs',
        jobTitle: 'Quantitative Analyst',
        industry: 'FinTech',
        location: 'Bengaluru, India',
        skills: ['Quantitative Finance', 'Python', 'Algorithmic Trading', 'C++'],
        expertise: ['FinTech Careers', 'Placement Prep'],
        bio: 'Quant Analyst at Goldman Sachs. Graduated top of CSBS class 2024.'
      }
    ];

    const alumni = [];
    for (const a of alumniData) {
      const u = new User({
        name: a.name,
        email: a.email,
        password: a.password,
        role: 'alumni',
        isVerified: a.isVerified
      });
      await u.save();

      const ap = await AlumniProfile.create({
        user: u._id,
        graduationYear: a.graduationYear,
        department: a.department,
        currentCompany: a.currentCompany,
        jobTitle: a.jobTitle,
        industry: a.industry,
        location: a.location,
        skills: a.skills,
        expertise: a.expertise,
        bio: a.bio,
        experience: [
          { company: a.currentCompany, title: a.jobTitle, duration: '2022 - Present', description: 'Leading key modules and mentoring junior devs.' }
        ],
        socialLinks: {
          linkedin: `https://linkedin.com/in/${a.name.toLowerCase().replace(/\s+/g, '')}`,
          github: `https://github.com/${a.name.toLowerCase().replace(/\s+/g, '')}`
        }
      });

      u.alumniProfile = ap._id;
      await u.save();
      alumni.push(u);
    }

    console.log(`Seeded 1 Admin, ${students.length} Students, and ${alumni.length} Alumni.`);

    // 4. Create Connection Requests
    const demoStudent = students[0];
    const demoAlumni = alumni[0];

    const connectionsData = [
      { sender: students[0]._id, receiver: alumni[0]._id, status: 'accepted', message: 'Hi Maam, would love to connect with you!' },
      { sender: students[0]._id, receiver: alumni[1]._id, status: 'accepted', message: 'Hello Sir, interested in Cloud Architecture.' },
      { sender: students[1]._id, receiver: alumni[0]._id, status: 'accepted', message: 'Hello! Requesting connection.' },
      { sender: students[2]._id, receiver: alumni[0]._id, status: 'pending', message: 'Hi! I am looking for guidance in mobile dev.' },
      { sender: students[3]._id, receiver: alumni[2]._id, status: 'pending', message: 'Hello Priya, interested in React roles.' },
      { sender: alumni[3]._id, receiver: students[0]._id, status: 'pending', message: 'Hi Siddharth, happy to connect.' },
      { sender: students[4]._id, receiver: alumni[1]._id, status: 'rejected', message: 'Requesting connection for cloud tips.' },
      { sender: students[1]._id, receiver: alumni[3]._id, status: 'accepted', message: 'Connecting regarding MS applications.' },
      { sender: students[2]._id, receiver: alumni[4]._id, status: 'pending', message: 'Hi Neha, interested in Goldman Sachs opportunities.' },
      { sender: students[3]._id, receiver: alumni[0]._id, status: 'accepted', message: 'Great to connect with CSBS Alumni.' }
    ];

    for (const conn of connectionsData) {
      await ConnectionRequest.create(conn);
    }

    // 5. Create Jobs & Internships
    const jobsData = [
      {
        title: 'Full Stack Software Engineer (SDE 1)',
        company: 'Google India',
        description: 'We are looking for enthusiastic Computer Science graduates to join our Core Platforms team. You will build high-throughput microservices using Node.js and React.',
        type: 'Job',
        location: 'Bengaluru, India',
        employmentType: 'Full-time',
        skillsRequired: ['React', 'Node.js', 'System Design', 'Data Structures'],
        eligibility: 'B.Tech CSBS / CSE / IT 2025-2026 Batch',
        salaryOrStipend: '₹ 22,000,000 / year',
        deadline: new Date('2026-11-30'),
        postedBy: alumni[0]._id
      },
      {
        title: 'Cloud DevOps Intern',
        company: 'Microsoft',
        description: '6-month intensive internship program working directly with Azure Cloud teams. Outstanding performance leads to pre-placement offers (PPO).',
        type: 'Internship',
        location: 'Hyderabad / Remote',
        employmentType: 'Remote',
        skillsRequired: ['Azure', 'Linux', 'Docker', 'Python'],
        eligibility: 'Pre-final and Final Year Students',
        salaryOrStipend: '₹ 80,000 / month',
        deadline: new Date('2026-10-25'),
        postedBy: alumni[1]._id
      },
      {
        title: 'Frontend Developer Intern (React/TypeScript)',
        company: 'Amazon Customer Experience',
        description: 'Join Amazon frontend engineering team building next-generation e-commerce web interfaces.',
        type: 'Internship',
        location: 'Pune, India',
        employmentType: 'Hybrid',
        skillsRequired: ['React', 'JavaScript', 'CSS Modules', 'Redux'],
        eligibility: 'Open to all CSBS/CSE students',
        salaryOrStipend: '₹ 65,000 / month',
        deadline: new Date('2026-11-15'),
        postedBy: alumni[2]._id
      },
      {
        title: 'Product Analyst Associate',
        company: 'Tesla Motors',
        description: 'Collaborate with cross-functional engineering and design teams to deliver product features and data analysis.',
        type: 'Job',
        location: 'Mumbai, India',
        employmentType: 'Full-time',
        skillsRequired: ['SQL', 'Python', 'Product Strategy', 'Communication'],
        eligibility: 'Graduating 2025/2026',
        salaryOrStipend: '₹ 16,000,000 / year',
        deadline: new Date('2026-12-10'),
        postedBy: alumni[3]._id
      },
      {
        title: 'Quantitative Finance Training & Placement Program',
        company: 'Goldman Sachs',
        description: 'Selective 8-week mentorship & bootcamp covering algorithmic trading, derivative pricing, and quantitative interviews.',
        type: 'Training Program',
        location: 'Bengaluru / Online',
        employmentType: 'Full-time',
        skillsRequired: ['C++', 'Python', 'Statistics', 'Algorithms'],
        eligibility: 'All Engineering Batches',
        salaryOrStipend: 'Fully Sponsored + Stipend',
        deadline: new Date('2026-10-30'),
        postedBy: alumni[4]._id
      }
    ];

    for (const j of jobsData) {
      await Job.create(j);
    }

    // 6. Create Events
    const eventsData = [
      {
        title: 'Cracking Top Tech Interviews (Google & Microsoft)',
        description: 'Interactive webinar on Coding Interviews, System Design preparation, and resume building.',
        type: 'Webinar',
        date: new Date('2026-10-20'),
        time: '06:00 PM - 07:30 PM',
        location: 'Google Meet (Online)',
        organizer: alumni[0]._id,
        speaker: 'Pranali Titvekar (Senior SDE at Google)',
        eligibility: 'Open to all KIT Students',
        maxParticipants: 200,
        registrationDeadline: new Date('2026-10-19')
      },
      {
        title: 'Hands-on Azure Cloud & Microservices Workshop',
        description: 'Practical workshop building and deploying microservices on Azure Kubernetes Service.',
        type: 'Workshop',
        date: new Date('2026-10-28'),
        time: '10:00 AM - 04:00 PM',
        location: 'CSBS Computer Lab 3 & Microsoft Teams',
        organizer: alumni[1]._id,
        speaker: 'Rahul Deshmukh (Cloud Architect at Microsoft)',
        eligibility: 'CSBS & CSE Students',
        maxParticipants: 80,
        registrationDeadline: new Date('2026-10-26')
      },
      {
        title: 'Annual KIT CSBS Alumni Meet & Networking Summit',
        description: 'Connect with over 50+ alumni working across top MNCs and startups worldwide.',
        type: 'Alumni Meet',
        date: new Date('2026-11-05'),
        time: '09:00 AM - 05:00 PM',
        location: 'Main Auditorium, KIT Campus Kolhapur',
        organizer: adminUser._id,
        speaker: 'Distinguished Alumni Panel',
        eligibility: 'All Students and Faculty',
        maxParticipants: 500,
        registrationDeadline: new Date('2026-11-01')
      },
      {
        title: 'Product Management & Abroad Higher Studies Webinar',
        description: 'Guidance on applying for MS in US/Europe and transitioning into Product Roles.',
        type: 'Career Event',
        date: new Date('2026-11-12'),
        time: '07:00 PM - 08:30 PM',
        location: 'Zoom Online',
        organizer: alumni[3]._id,
        speaker: 'Vikram Joshi (PM at Tesla)',
        eligibility: 'Pre-final & Final Year Students',
        maxParticipants: 150,
        registrationDeadline: new Date('2026-11-10')
      },
      {
        title: 'FinTech Algorithmic Trading Masterclass',
        description: 'Deep dive into quantitative finance strategies and competitive programming tips.',
        type: 'Training Program',
        date: new Date('2026-11-20'),
        time: '05:00 PM - 07:00 PM',
        location: 'Virtual Classroom',
        organizer: alumni[4]._id,
        speaker: 'Neha Mehta (Goldman Sachs)',
        eligibility: 'All Departments',
        maxParticipants: 100,
        registrationDeadline: new Date('2026-11-18')
      }
    ];

    const createdEvents = [];
    for (const e of eventsData) {
      const ev = await Event.create(e);
      createdEvents.push(ev);
    }

    // Register demo student to events
    await EventRegistration.create({ event: createdEvents[0]._id, user: demoStudent._id });
    await EventRegistration.create({ event: createdEvents[1]._id, user: demoStudent._id });

    // 7. Create Mentorship Requests & Sessions
    const mentorshipData = [
      {
        student: demoStudent._id,
        alumni: alumni[0]._id,
        topic: 'Career Guidance',
        message: 'Hi Maam, I would love guidance on preparing for Google SDE placement drives and resume feedback.',
        preferredDate: '2026-10-22',
        preferredTime: '05:00 PM',
        status: 'Scheduled',
        responseMessage: 'Glad to assist! Lets meet on Google Meet at the preferred time.',
        meetingLink: 'https://meet.google.com/abc-xyz-connect'
      },
      {
        student: demoStudent._id,
        alumni: alumni[1]._id,
        topic: 'Placement',
        message: 'Hello Sir, need guidance on clearing Microsoft cloud interview rounds.',
        preferredDate: '2026-10-24',
        preferredTime: '06:00 PM',
        status: 'Pending'
      },
      {
        student: students[1]._id,
        alumni: alumni[0]._id,
        topic: 'Technical Guidance',
        message: 'Hi, seeking advice on system design and scalable API building.',
        preferredDate: '2026-10-26',
        preferredTime: '04:00 PM',
        status: 'Accepted',
        responseMessage: 'Accepted! Looking forward to our discussion.'
      },
      {
        student: students[2]._id,
        alumni: alumni[2]._id,
        topic: 'Placement',
        message: 'Guidance needed for Amazon frontend interview round.',
        preferredDate: '2026-10-27',
        preferredTime: '07:00 PM',
        status: 'Scheduled',
        responseMessage: 'Sure, we can do a mock frontend interview.'
      },
      {
        student: students[3]._id,
        alumni: alumni[3]._id,
        topic: 'Higher Studies',
        message: 'Inquiring about GRE preparation and CMU application process.',
        preferredDate: '2026-10-29',
        preferredTime: '08:00 PM',
        status: 'Pending'
      }
    ];

    for (const m of mentorshipData) {
      const mr = await MentorshipRequest.create(m);
      if (m.status === 'Scheduled' || m.status === 'Accepted') {
        await MentorshipSession.create({
          request: mr._id,
          student: m.student,
          alumni: m.alumni,
          topic: m.topic,
          date: new Date(m.preferredDate),
          time: m.preferredTime,
          meetingLink: m.meetingLink || 'https://meet.google.com/demo-mentorship-room',
          status: 'Scheduled'
        });
      }
    }

    // 8. Create Career Resources
    const resourcesData = [
      {
        title: 'Ultimate System Design & DSA Interview Guide',
        description: 'Comprehensive roadmap and top 100 System Design interview questions asked at FANG companies.',
        category: 'Interview Prep',
        fileUrl: '',
        externalUrl: 'https://github.com/donnemartin/system-design-primer',
        fileType: 'PDF',
        uploadedBy: alumni[0]._id
      },
      {
        title: 'MERN Stack Resume Template & Checklist 2026',
        description: 'Standardized ATS-friendly resume format recommended for campus placements.',
        category: 'Resume Guide',
        fileUrl: '',
        externalUrl: 'https://overleaf.com/latex/templates',
        fileType: 'DOCX',
        uploadedBy: alumni[2]._id
      },
      {
        title: 'Azure Cloud Certification & Microservices Roadmap',
        description: 'Step by step guide to clear AZ-900 and AZ-204 certifications.',
        category: 'Career Guide',
        fileUrl: '',
        externalUrl: 'https://learn.microsoft.com/en-us/azure',
        fileType: 'PDF',
        uploadedBy: alumni[1]._id
      },
      {
        title: 'MS Application Statement of Purpose (SOP) Samples',
        description: 'Verified SOP samples for Carnegie Mellon, Stanford, and MIT MS programs.',
        category: 'Placement Material',
        fileUrl: '',
        externalUrl: 'https://cmu.edu',
        fileType: 'PDF',
        uploadedBy: alumni[3]._id
      },
      {
        title: 'CSBS Department Final Year Project Handbook',
        description: 'Official guideline for software architecture and documentation standards.',
        category: 'Technical Docs',
        fileUrl: '',
        externalUrl: 'https://kitcoek.in',
        fileType: 'PDF',
        uploadedBy: adminUser._id
      }
    ];

    for (const r of resourcesData) {
      await Resource.create(r);
    }

    // 9. Create Sample Conversations and Messages
    const conv = await Conversation.create({
      participants: [demoStudent._id, demoAlumni._id]
    });

    const msg1 = await Message.create({
      conversation: conv._id,
      sender: demoStudent._id,
      receiver: demoAlumni._id,
      content: 'Hello Pranali Maam! Thank you for accepting my connection request.'
    });

    const msg2 = await Message.create({
      conversation: conv._id,
      sender: demoAlumni._id,
      receiver: demoStudent._id,
      content: 'You are welcome Siddharth! Feel free to ask any questions about Google interview prep or software development.'
    });

    conv.lastMessage = msg2._id;
    await conv.save();

    // 10. Create Notifications
    await Notification.create({
      recipient: demoStudent._id,
      sender: demoAlumni._id,
      type: 'connection_accepted',
      title: 'Connection Accepted',
      message: 'Pranali Titvekar accepted your connection request.',
      isRead: false
    });

    await Notification.create({
      recipient: demoStudent._id,
      sender: demoAlumni._id,
      type: 'mentorship_accepted',
      title: 'Mentorship Session Scheduled',
      message: 'Pranali Titvekar scheduled your mentorship session for 2026-10-22 at 05:00 PM.',
      isRead: false
    });

    await Notification.create({
      recipient: demoAlumni._id,
      sender: demoStudent._id,
      type: 'connection_request',
      title: 'New Connection Request',
      message: 'Abhishek Jambhale sent you a connection request.',
      isRead: false
    });

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding Error:', error);
    process.exit(1);
  }
};

seedData();
