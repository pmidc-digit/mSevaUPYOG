import React from 'react';

const AboutSection = () => {
  const highlights = [
    { icon: "🏛️", text: "Incorporated in March 2009" },
    { icon: "📋", text: "Licensed under Section 25" },
    { icon: "🎯", text: "State Level Nodal Agency" },
    { icon: "🤝", text: "Public-Private Partnerships" }
  ];

  return (
    <section className="landing-about-section">
      <div className="landing-about-container">
        <div className="landing-about-header">
          <span className="landing-about-badge">About Us</span>
          <h2 className="landing-about-title">Punjab Municipal Infrastructure Development Corporation</h2>
          <div className="landing-about-divider"></div>
        </div>

        <div className="landing-about-content">
          <div className="landing-about-main">
            <div className="landing-about-card landing-about-card-left">
              <div className="landing-about-card-accent"></div>
              <h3>Our Mission</h3>
              <p>
                PMIDC is a non-profit making company constituted by the Department of Local 
                Government with an objective to uplift the living standard of urban population
                including urban poor in the State of Punjab. The Company has been duly licensed
                under Section 25 of the Companies Act and incorporated in March, 2009.
              </p>
              <p>
                Chief Secretary is the Chairman and Principal Secretary, Local Government as
                its ex-officio Managing Director.
              </p>
              <p>
                PMIDC manages the Punjab Municipal Infrastructure Development Fund (PMIDF) created
                under Punjab Municipal Infrastructure Development Act, 2011, assigning 20% of the 
                Additional Tax (surcharge) on VAT with objective to raise resources for
                infrastructure development projects.
              </p>
            </div>

            <div className="landing-about-card landing-about-card-right">
              <div className="landing-about-card-accent"></div>
              <h3>Our Role</h3>
              <p>
                We work with nationalized banks, scheduled banks, and Financial Institutions to
                provide financial assistance to municipalities for infrastructure development projects.
              </p>
              <p>
                PMIDC has been declared as state level nodal agency for <strong>JNNURM</strong>, 
                <strong> AMRUT</strong>, <strong>Smart City</strong>, <strong>Swachh Bharat Mission</strong> and 
                is also co-ordinating some of the State level initiatives including E-Governance, 
                Energy Efficiency, Solid Waste Management, and World Bank Projects.
              </p>
              <p>
                It is intended to position PMIDC as a vehicle for large scale resource mobilisation
                and public-private partnerships in the urban sector.
              </p>
            </div>
          </div>

          <div className="landing-about-highlights">
            {highlights.map((item, index) => (
              <div key={index} className="landing-about-highlight-item">
                <span className="landing-about-highlight-icon">{item.icon}</span>
                <span className="landing-about-highlight-text">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;