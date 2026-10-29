import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Mail, Phone, ExternalLink } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="college-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <h3>Prasad V. Potluri Siddhartha Institute of Technology</h3>
            <p>
              (Autonomous) Sponsored by Siddhartha Academy of General and Technical Education. Approved by AICTE, Accredited with NAAC 'A+' Grade, Permanent Affiliation to JNTUK, Kakinada.
            </p>
            <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.82rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <MapPin size={14} /> Kanuru, Vijayawada, Andhra Pradesh - 520007
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Mail size={14} /> principal@pvpsiddhartha.ac.in
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Phone size={14} /> 0866 - 2581699 / 2583037
              </span>
            </div>
          </div>

          <div className="footer-col">
            <h4>Academic Departments</h4>
            <ul className="footer-links">
              <li><Link to="/notices?search=CSE">Computer Science & Engineering (CSE)</Link></li>
              <li><Link to="/notices?search=AI">CSE (Artificial Intelligence & ML)</Link></li>
              <li><Link to="/notices?search=Data">CSE (Data Science)</Link></li>
              <li><Link to="/notices?search=ECE">Electronics & Communication (ECE)</Link></li>
              <li><Link to="/notices?search=EEE">Electrical & Electronics (EEE)</Link></li>
              <li><Link to="/notices?search=Mechanical">Mechanical & Civil Engineering</Link></li>
              <li><Link to="/notices?search=IT">Information Technology (IT)</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Quick Access</h4>
            <ul className="footer-links">
              <li><Link to="/notices?category=Exams">Examination Cell Schedules</Link></li>
              <li><Link to="/notices?category=Placements">Training & Placement Drives</Link></li>
              <li><Link to="/notices?category=Scholarships">Scholarships & Financial Aid</Link></li>
              <li><Link to="/login">Student & Staff Portal Sign In</Link></li>
              <li><Link to="/register">New Student Account Registration</Link></li>
              <li><Link to="/admin">Admin Notice Desk</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <div>
            © {new Date().getFullYear()} PVPSIT College. All Rights Reserved.
          </div>
          <div>
            PVPSIT Digital Notice Board • Full-Stack MERN College Project
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
