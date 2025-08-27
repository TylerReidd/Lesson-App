import React, {useState} from 'react'
import Sidebar from '../components/Sidebar'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'



export default function PrivacyPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <>
     <Navbar onMenu={() => setMenuOpen(!menuOpen)} isMenuOpen={menuOpen} /> 
    <Link style={{fontSize:'2rem', paddingLeft:'10%'}} className="link-back" to="/teacher">← Back to Dashboard</Link>
    <div className='container container-center'>
      <div className="card">
        <div className="card-header">
          <h1 className='privacy-text'>Privacy & Security</h1>
        </div>
        <div className="card-body">
          <p className='privacy-text'>
            We take your privacy and security very seriously. Here's what that means when you use this app:
          </p>

          <section className="panel mb-4">
            <h2 className='privacy-text'>Password Safety</h2>
            <p className='privacy-text'>
              Your password is never stored in plain text. We use industry-standard <b>bcrypt hashing</b> to protect our customers. So even if the database wre compromised, your actual password remains safe. 
            </p>
          </section>

          <section className="panel mb-4">
            <h2 className='privacy-text'>Secure Login</h2>
            <p className='privacy-text'>
              When you log in, you receive a secure token stored in an <b>HttpOnly cookie</b>. This cookie cannot be accessed by other websites or scripts, protecting you from common web attacks. All data travels over <b>HTTPS encrpytion</b>.
            </p>
          </section>

          <section className="panel mb-4">
            <h2 className='privacy-text'>Access Control</h2>
            <p className='privacy-text'>
              Teachers and students only see the information relevant to them. Students cannot see each others files, and teachers cannot access data belong to other teachers. 
            </p>
          </section>

          <section className='panel mb-4'>
            <h2 className='privacy-text'>File  Safety</h2>
            <p className='privacy-text'>
              Assignments and videos are only available to teacher and the student they are shared with. Every file request is checkedto make sure you are authorized to access it.
            </p>
          </section>

          <section className="panel mb-4">
            <h2 className='privacy-text'>Minimal Data Collection</h2>
            <p className='privacy-text'>
              We only ask for the bare essentials: Your name, email and password. No unnecessary personal data is collected, and we will <b>NEVER</b> share or sell your information with or to third parties.
            </p>
          </section>

          <section className='panel mb-4'>
            <h2 className='privacy-text'>Your Controls</h2>
            <p className='privacy-text'>
              You can log out anytime, which clears the session. If you ever want your account deleted, we will remove your data from our system. 
            </p>
          </section>

          <footer className="mt-16 subtle">
            <p>
              Questions or concerns? Please contact the site administrator. 
              (tylers phone # here)
            </p>
          </footer>
        </div>
      </div>
    </div>
    </>
  )
}