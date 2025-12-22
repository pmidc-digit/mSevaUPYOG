import React, {useState} from "react";

const MiddleSection = () => {
  const images = [
    "https://via.placeholder.com/400x200/3b82f6/ffffff?text=Smart+City",
    "https://via.placeholder.com/400x200/10b981/ffffff?text=AMRUT",
    "https://via.placeholder.com/400x200/8b5cf6/ffffff?text=Swachh+Bharat",
    "https://via.placeholder.com/400x200/f59e0b/ffffff?text=Urban+Development",
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const projects = [
    { name: "SMART CITY MISSION", icon: "🏙️" },
    { name: "AMRUT", icon: "💧" },
    { name: "SWACHH BHARAT MISSION", icon: "🌿" },
    { name: "SWM", icon: "♻️" },
  ];

  const newsItems = [
    "PMIDC is a non-profit organization to uplift urban living standards.",
    "Chief Secretary is the Chairman and Principal Secretary.",
    "Government initiatives for better urban development.",
    "New digital services launched for citizen convenience.",
  ];

  return (
    <section className="landing-middle-section">
      <div className="landing-middle-container">
        <div className="landing-section-header">
          <h2 className="landing-section-title">Explore Our Initiatives</h2>
          <p className="landing-section-subtitle">Discover the latest government projects and news updates</p>
        </div>

        <div className="landing-middle-grid">
          {/* Latest Projects Card */}
          <div className="landing-info-card landing-projects-card">
            <div className="landing-card-header">
              <div className="landing-card-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19ZM7 10H9V17H7V10ZM11 7H13V17H11V7ZM15 13H17V17H15V13Z" fill="currentColor"/>
                </svg>
              </div>
              <h3 className="landing-card-title">Latest Projects</h3>
            </div>
            <div className="landing-projects-list">
              {projects.map((project, index) => (
                <a href="#" key={index} className="landing-project-item">
                  <span className="landing-project-icon">{project.icon}</span>
                  <span className="landing-project-name">{project.name}</span>
                  <svg className="landing-project-arrow" viewBox="0 0 24 24" fill="none">
                    <path d="M8.59 16.59L13.17 12L8.59 7.41L10 6L16 12L10 18L8.59 16.59Z" fill="currentColor"/>
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Photo Gallery Card */}
          <div className="landing-info-card landing-gallery-card">
            <div className="landing-card-header">
              <div className="landing-card-icon landing-card-icon-purple">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 19V5C21 3.9 20.1 3 19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19ZM8.5 13.5L11 16.51L14.5 12L19 18H5L8.5 13.5Z" fill="currentColor"/>
                </svg>
              </div>
              <h3 className="landing-card-title">Photo Gallery</h3>
            </div>
            <div className="landing-gallery-container">
              <img
                src={images[currentIndex]}
                alt={`Slide ${currentIndex}`}
                className="landing-gallery-image"
              />
              <div className="landing-gallery-controls">
                <button className="landing-gallery-btn" onClick={handlePrev}>
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M15.41 16.59L10.83 12L15.41 7.41L14 6L8 12L14 18L15.41 16.59Z" fill="currentColor"/>
                  </svg>
                </button>
                <div className="landing-gallery-dots">
                  {images.map((_, index) => (
                    <span 
                      key={index} 
                      className={`landing-gallery-dot ${index === currentIndex ? 'active' : ''}`}
                      onClick={() => setCurrentIndex(index)}
                    />
                  ))}
                </div>
                <button className="landing-gallery-btn" onClick={handleNext}>
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M8.59 16.59L13.17 12L8.59 7.41L10 6L16 12L10 18L8.59 16.59Z" fill="currentColor"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* News Highlights Card */}
          <div className="landing-info-card landing-news-card">
            <div className="landing-card-header">
              <div className="landing-card-icon landing-card-icon-amber">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 18H4V8L12 13L20 8V18ZM12 11L4 6H20L12 11Z" fill="currentColor"/>
                </svg>
              </div>
              <h3 className="landing-card-title">News Highlights</h3>
            </div>
            <div className="landing-news-list">
              {newsItems.map((news, index) => (
                <div key={index} className="landing-news-item">
                  <span className="landing-news-bullet"></span>
                  <p className="landing-news-text">{news}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MiddleSection;
