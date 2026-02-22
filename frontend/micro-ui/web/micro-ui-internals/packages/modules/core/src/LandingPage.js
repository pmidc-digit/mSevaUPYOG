import React, {useEffect} from 'react';
import { useHistory } from 'react-router-dom';
import AboutSection from './components/AboutSection';
import HelpSection from './components/HelpSection';
import MiddleSection from './components/MiddleSection';
import TopSection from './components/TopSection';
import Header from './components/Header'
import Footer from './components/Footer'

const LandingPage = () => {
  const history = useHistory();

  const navigateToEmployeeApp = () => {
    history.push('/digit-ui/employee');
  };

  const navigateToCitizenApp = () => {
    history.push('/digit-ui/citizen');
  };
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://translation-plugin.bhashini.co.in/v3/website_translation_utility.js ";
    script.async = true;document.body.appendChild(script);
  }, []);
  return (
    <div className="landing-page">
      {/* Hero Section with Login Cards */}
      <div className='language-plugin-landing'>
        <div className="bhashini-plugin-container"></div>
      </div>
      <section className="landing-hero">
        <div className="landing-hero-overlay"></div>
        <div className="landing-hero-content">
          <div className="landing-hero-text">
            
            <h1 className="landing-hero-title">
              Welcome to <span>mSeva Punjab</span>
            </h1>
            <p className="landing-hero-subtitle">
              Your one-stop platform for all municipal services. Access government services digitally with ease and transparency.
            </p>
          </div>
          
          {/* Login Cards */}
          <div className="landing-login-cards">
            <div className="landing-login-card landing-login-card-citizen" onClick={navigateToCitizenApp}>
              <div className="landing-login-card-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="currentColor"/>
                </svg>
              </div>
              <h3 className="landing-login-card-title">Citizen Login</h3>
              <p className="landing-login-card-desc">Access services like Property Tax, Water Bills, Trade License & more</p>
              <div className="landing-login-card-btn">
                <span>Continue as Citizen</span>
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 4L10.59 5.41L16.17 11H4V13H16.17L10.59 18.59L12 20L20 12L12 4Z" fill="currentColor"/>
                </svg>
              </div>
            </div>

            <div className="landing-login-card landing-login-card-employee" onClick={navigateToEmployeeApp}>
              <div className="landing-login-card-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 7H4C2.9 7 2 7.9 2 9V15C2 16.1 2.9 17 4 17H20C21.1 17 22 16.1 22 15V9C22 7.9 21.1 7 20 7ZM20 15H4V9H20V15ZM12 10C10.9 10 10 10.9 10 12C10 13.1 10.9 14 12 14C13.1 14 14 13.1 14 12C14 10.9 13.1 10 12 10ZM6 12C6 11.45 6.45 11 7 11C7.55 11 8 11.45 8 12C8 12.55 7.55 13 7 13C6.45 13 6 12.55 6 12ZM16 12C16 11.45 16.45 11 17 11C17.55 11 18 11.45 18 12C18 12.55 17.55 13 17 13C16.45 13 16 12.55 16 12Z" fill="currentColor"/>
                </svg>
              </div>
              <h3 className="landing-login-card-title">Employee Login</h3>
              <p className="landing-login-card-desc">Government employees can manage and process citizen applications</p>
              <div className="landing-login-card-btn">
                <span>Continue as Employee</span>
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 4L10.59 5.41L16.17 11H4V13H16.17L10.59 18.59L12 20L20 12L12 4Z" fill="currentColor"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Carousel */}
      <TopSection/>
      
      {/* Header Navigation */}
      <Header />
      
      {/* Main Content */}
      {/* <MiddleSection/> */}
      
      {/* Help Section */}
      {/* <HelpSection/> */}
      
      {/* About Section */}
      <AboutSection/>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default LandingPage;
