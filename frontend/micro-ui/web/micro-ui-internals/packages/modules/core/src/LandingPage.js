import React from 'react';
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


  const containerStyle = {
    //textAlign: 'center',
    marginTop: '50px',
    backgroundColor: "white"
  };

  return (
    <div className="landingPage" style={containerStyle}>
      {/* <h1>This is our Landing Page</h1> */}
     
      {/* <TopSection/> */}
      <Header />
      <MiddleSection/>
      <HelpSection/>
      <AboutSection/>
      <Footer />
    </div>
  );
};

export default LandingPage;
