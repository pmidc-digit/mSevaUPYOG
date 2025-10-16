import React, { useEffect, useState } from "react";
import { Card, CardText, Toast } from "@mseva/digit-ui-react-components";
import { Link, useHistory } from "react-router-dom";

const CustomLandingPage = () => {
  const history = useHistory()

  const [showToast, setShowToast] = useState(null)
  const [isArchitect, setIsArchitect] = useState(false)

  // Hide sidebar and adjust containers for full-page layout
  useEffect(() => {
    const sidebar = document.querySelector('.SideBarStatic');
    const mainContainer = document.querySelector('.main.center-container');
    const citizenContainer = document.querySelector('.citizen-home-container');
    
    if (sidebar) sidebar.style.display = 'none';
    if (mainContainer) {
      mainContainer.style.padding = '0';
      mainContainer.style.width = '100%';
    }
    if (citizenContainer) {
      citizenContainer.style.padding = '0';
      citizenContainer.style.width = '100%';
    }

    setIsArchitect(validateArchitectRole())
    
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

   const closeToast = () => {
    setShowToast(null)
  }

    const validateArchitectRole = () => {
    try {
      const userInfoString = localStorage.getItem("user-info")
      if (!userInfoString) {
        return false
      }

      const userInfo = JSON.parse(userInfoString)

      if (!userInfo.roles || !Array.isArray(userInfo.roles)) {
        return false
      }

      return userInfo.roles.some((role) => role.code === "BPA_ARCHITECT")
    } catch (error) {
      console.error("Error validating architect role:", error)
      return false
    }
  }

  const handleProfessionalLoginClick = (e) => {
    e.preventDefault()

    if (validateArchitectRole()) {
      history.push("/digit-ui/citizen/obps/edcrscrutiny/apply/home")
    } else {
      setShowToast({
        error: true,
        message: "Access Denied.",
      })
    }
  }
  
  const links = [
    { title: "Professional Login", url: "/digit-ui/citizen/obps/edcrscrutiny/apply/home", external: false, },
    { title: "Professional Dashboard", url: "/digit-ui/citizen/obps/home", external: true, requiresArchitect: true, },
     {
      title: "Register as Professional",
      url: "/digit-ui/citizen/obps/stakeholder/apply/stakeholder-docs-required",
      external: false,
      showForNonArchitect: true, 
    },
    { title: "User Manual", url: "https://sdc-uat.lgpunjab.gov.in/filestore/v1/files/viewfile/?name=pb%2Fproperty-upload%2FOctober%2F8%2F1759931687672rlOgUaoaId.pdf", external: true },
    { title: "Assistance", external: true },
    { title: "Feedback", url: "https://docs.google.com/forms/d/e/1FAIpQLScfZlGldfyIs_3KZAX9lRpx43OjCrKnw33SbzvN6I3Gi2Uj_A/viewform?usp=header", external: true },
    { title: "View applications by Citizen", url: "/digit-ui/citizen/obps/my-applications", external: false },
    { title: "FAQs", url: "/digit-ui/citizen/obps-faq", external: false },
  ];

  // Common card styles
  const cardStyle = {
    padding: '24px 20px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    background: 'rgba(255, 255, 255, 0.25)',
    backdropFilter: 'blur(10px)',
    border: '2px solid rgba(255, 255, 255, 0.4)',
    borderRadius: '8px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.3)'
  };

  const cardTextStyle = {
    fontSize: '20px',
    fontWeight: '700',
    textAlign: 'center',
    color: '#ffffff',
    textShadow: '1px 1px 3px rgba(0,0,0,0.8)',
    letterSpacing: '0.3px'
  };

  const handleMouseEnter = (e) => {
    e.currentTarget.style.transform = 'translateY(-4px)';
    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.4)';
    e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.4)';
  };

  const handleMouseLeave = (e) => {
    e.currentTarget.style.transform = 'translateY(0)';
    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
    e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.3)';
  };

  const renderInstructions = ( title) => {
    if (title == "Professional Login") {
      // Professional Login instructions
      return (
        <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '2px solid rgba(255, 255, 255, 0.5)', background: 'rgba(0, 0, 0, 0.2)', padding: '16px', borderRadius: '6px' }}>
          <div style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '12px', color: '#ffffff', textShadow: '1px 1px 3px rgba(0,0,0,0.9)' }}>
            Test Login Details:
          </div>
          <div style={{ marginBottom: '10px' }}>
            <div style={{ fontSize: '13px', fontWeight: '600', color: '#ffeb3b', marginBottom: '4px', textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
              Use any mobile number below:
            </div>
            <div style={{ fontSize: '12px', color: '#ffffff', fontFamily: 'monospace', backgroundColor: 'rgba(0, 0, 0, 0.3)', padding: '6px 8px', borderRadius: '4px', lineHeight: '1.5' }}>
              9988112233, 9988112234, 9988112235<br/>9988112236, 8888888889, 9988112237<br/>9988112238, 8196991952
            </div>
          </div>
          <div style={{ marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#ffeb3b', textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>OTP:</span>
            <span style={{ fontSize: '13px', color: '#ffffff', marginLeft: '8px', fontFamily: 'monospace', backgroundColor: 'rgba(0, 0, 0, 0.3)', padding: '4px 10px', borderRadius: '4px', fontWeight: 'bold' }}>123456</span>
          </div>
          <div>
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#ffeb3b', textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>Location:</span>
            <span style={{ fontSize: '13px', color: '#ffffff', marginLeft: '8px', textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>Amritsar</span>
          </div>
        </div>
      );
    } else if (title == "Assistance") {
      // Assistance instructions
      return (
        <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '2px solid rgba(255, 255, 255, 0.5)', background: 'rgba(0, 0, 0, 0.2)', padding: '16px', borderRadius: '6px' }}>
          <div style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '12px', color: '#ffffff', textShadow: '1px 1px 3px rgba(0,0,0,0.9)' }}>
            For Any Assistance:
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: '600', color: '#ffeb3b', marginBottom: '4px', textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
              Contact us at:
            </div>
            <div style={{ fontSize: '14px', color: '#ffffff', fontFamily: 'monospace', backgroundColor: 'rgba(0, 0, 0, 0.3)', padding: '8px 12px', borderRadius: '4px', fontWeight: 'bold', letterSpacing: '1px' }}>
              +91 98155 98785
            </div>
          </div>
        </div>
      );
    }
    return null;
  };


  return (
    <div style={{ width: '100%', marginTop: '-25px', position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>
      {/* Background Image */}
      <img 
        src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2000&q=80" 
        alt="Building Plan Approval"
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 1 }}
      />
      
      {/* Dark Overlay */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0, 0, 0, 0.4)', zIndex: 2 }} />
      
      {/* Content */}
      <div style={{ position: 'relative', zIndex: 3, width: '100%', minHeight: '100vh', padding: '0' }}>
        <h1 style={{ color: 'white', fontSize: '3rem', fontWeight: 'bold', textShadow: '2px 2px 8px rgba(0,0,0,0.8)', margin: '0', padding: '80px 20px 0 20px', textAlign: 'center' }}>
          Building Plan Approval
        </h1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '600px', width: '100%', marginTop: '50px', paddingLeft: '80px', paddingRight: '20px' }}>
          {links.map((link, index) => {
            if (link.showForNonArchitect && isArchitect) {
              return null
            }
            const CardComponent = (
              <Card style={cardStyle} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                <CardText style={{ ...cardTextStyle, marginBottom: (index === 0 || index === 2) ? '16px' : '0' }}>
                  {link.title}
                </CardText>
                {renderInstructions(link.title)}
              </Card>
            );

            return (
              // <React.Fragment key={index}>
              //   {link.external ? (
              //     <a href={link.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
              //       {CardComponent}
              //     </a>
              //   ) : (
              //     <Link to={link.url} style={{ textDecoration: 'none' }}>
              //       {CardComponent}
              //     </Link>
              //   )}
              // </React.Fragment>
               <React.Fragment key={index}>
                {link.requiresArchitect ? (
                  <div onClick={handleProfessionalLoginClick} style={{ textDecoration: "none" }}>
                    {CardComponent}
                  </div>
                ) : link.external ? (
                  link.url ? (
                    <a href={link.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                      {CardComponent}
                    </a>
                  ) : (
                    <div style={{ textDecoration: "none" }}>{CardComponent}</div>
                  )
                ) : (
                  <Link to={link.url} style={{ textDecoration: "none" }}>
                    {CardComponent}
                  </Link>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
       {showToast && (
        <Toast
          error={showToast?.error}
          warning={showToast?.warning}
          label={showToast?.message}
          isDleteBtn={true}
          onClose={closeToast}
        />
      )}
    </div>
  );
};

export default CustomLandingPage;