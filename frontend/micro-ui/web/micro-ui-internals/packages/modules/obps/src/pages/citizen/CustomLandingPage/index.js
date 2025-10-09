import React, { useEffect } from "react";
import { Card, CardText } from "@mseva/digit-ui-react-components";
import { Link } from "react-router-dom";

const CustomLandingPage = () => {
  console.log("🎉 CustomLandingPage Component Rendered!");
  
  // Add media query styles to head
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @media (min-width: 780px) {
        .moduleLinkHomePage h1 {
          position: absolute !important;
          top: calc(-8vw + 0px) !important;
          left: 45.8rem !important;
        }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  
  // Hide sidebar on mount
  useEffect(() => {
    const sidebar = document.querySelector('.SideBarStatic');
    if (sidebar) sidebar.style.display = 'none';
    
    const mainContainer = document.querySelector('.main.center-container');
    if (mainContainer) {
      mainContainer.style.padding = '0';
      mainContainer.style.width = '100%';
    }
    
    const citizenContainer = document.querySelector('.citizen-home-container');
    if (citizenContainer) {
      citizenContainer.style.padding = '0';
      citizenContainer.style.width = '100%';
    }
    
    // Cleanup
    return () => {
      if (sidebar) sidebar.style.display = '';
      if (mainContainer) {
        mainContainer.style.padding = '';
        mainContainer.style.width = '';
      }
      if (citizenContainer) {
        citizenContainer.style.padding = '';
        citizenContainer.style.width = '';
      }
    };
  }, []);
  
  const links = [
    { 
      title: "Professional Login", 
      url: "/digit-ui/citizen/obps/edcrscrutiny/apply/home",
      external: false
    },
    
    { 
      title: "User Manual", 
      url: "https://sdc-uat.lgpunjab.gov.in/filestore/v1/files/viewfile/?name=pb%2Fproperty-upload%2FOctober%2F8%2F1759931687672rlOgUaoaId.pdf ",
      external: true
    },
    { 
      title: "Assistance", 
      url: "/digit-ui/citizen",
      external: true
    },
    { 
      title: "Feedback", 
      url: "/digit-ui/citizen",
      external: true
    },
    { 
      title: "View applications by Citizen", 
      url: "/digit-ui/citizen/obps/bpa/inbox",
      external: false
    },
    { 
      title: "FAQs", 
      url: "//digit-ui/citizen/obps-faq",
      external: false
    },
  ];

  return (
    <div className="moduleLinkHomePage" style={{ 
      width: '100%', 
      marginTop: '-25px',
      position: 'relative',
      minHeight: '100vh',
      overflow: 'hidden'
    }}>
      {/* Banner Image Section - Full background */}
      <img 
        src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2000&q=80" 
        alt="Building Plan Approval Banner"
        className="landing-background-image"
        style={{ 
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%', 
          height: '100%', 
          objectFit: 'cover',
          zIndex: 1
        }}
      />
      
      {/* Dark overlay for better readability */}
      <div className="landing-overlay" style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'rgba(0, 0, 0, 0.4)',
        zIndex: 2
      }} />
      
      {/* Content container */}
      <div className="landing-content" style={{
        position: 'relative',
        zIndex: 3,
        width: '100%',
        minHeight: '100vh',
        padding: '0'
      }}>
        {/* Title - Centered */}
        <h1 className="landing-title" style={{ 
          color: 'white',
          fontSize: '3rem',
          fontWeight: 'bold',
          textShadow: '2px 2px 8px rgba(0,0,0,0.8)',
          margin: '0',
          padding: '80px 20px 0 20px',
          textAlign: 'center',
          zIndex: 10
        }}>
          Building Plan Approval
        </h1>

        {/* Links Section - Left aligned, below title */}
        <div className="landing-links-container" style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          maxWidth: '600px',
          width: '100%',
          marginTop: '200px',
          paddingLeft: '80px',
          paddingRight: '20px'
        }}>
          {links.map((link, index) => (
            link.external ? (
              <a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="landing-link-wrapper"
                style={{ textDecoration: 'none' }}
              >
                <Card className="landing-card" style={{
                  padding: '24px 20px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  background: 'rgba(255, 255, 255, 0.25)',
                  backdropFilter: 'blur(10px)',
                  border: '2px solid rgba(255, 255, 255, 0.4)',
                  borderRadius: '8px',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.3)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.4)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.3)';
                }}>
                  <CardText className="landing-card-text" style={{
                    fontSize: '20px',
                    fontWeight: '700',
                    textAlign: 'center',
                    color: '#ffffff',
                    textShadow: '1px 1px 3px rgba(0,0,0,0.8)',
                    letterSpacing: '0.3px'
                  }}>
                    {link.title}
                  </CardText>
                </Card>
              </a>
            ) : (
              <Link
                key={index}
                to={link.url}
                className="landing-link-wrapper"
                style={{ textDecoration: 'none' }}
              >
                <Card className="landing-card" style={{
                  padding: '24px 20px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  background: 'rgba(255, 255, 255, 0.25)',
                  backdropFilter: 'blur(10px)',
                  border: '2px solid rgba(255, 255, 255, 0.4)',
                  borderRadius: '8px',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.3)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.4)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.3)';
                }}>
                  <CardText className="landing-card-text" style={{
                    fontSize: '20px',
                    fontWeight: '700',
                    textAlign: 'center',
                    color: '#ffffff',
                    textShadow: '1px 1px 3px rgba(0,0,0,0.8)',
                    letterSpacing: '0.3px'
                  }}>
                    {link.title}
                  </CardText>
                </Card>
              </Link>
            )
          ))}
        </div>
      </div>
    </div>
  );
};

export default CustomLandingPage;
