import React, { useState, useEffect, useRef } from 'react';

const TopSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [direction, setDirection] = useState('next');
  const [itemsToShow, setItemsToShow] = useState(4);
  const containerRef = useRef(null);

  const imagesList = [
    {
      link: "https://raw.githubusercontent.com/anujkit/msevaImages/refs/heads/main/fire_noc%20icon.png",
      altName: "firNocLogo",
      text: "Fire NOC",
    },
    {
      link: "https://raw.githubusercontent.com/anujkit/msevaImages/refs/heads/main/property_tax%20icon.png",
      altName: "propertyTaxLogo",
      text: "Property Tax",
    },
    {
      link: "https://raw.githubusercontent.com/anujkit/msevaImages/refs/heads/main/ws_icon.png",
      altName: "wsLogo",
      text: "Water & Sewerage",
    },
    {
      link: "https://raw.githubusercontent.com/anujkit/msevaImages/refs/heads/main/trade%20icon.png",
      altName: "tlLogo",
      text: "Trade License",
    },
    {
      link: "https://raw.githubusercontent.com/anujkit/msevaImages/refs/heads/main/pet%20icon.png",
      altName: "petLogo",
      text: "Pet Registration",
    },
    {
      link: "https://raw.githubusercontent.com/anujkit/msevaImages/refs/heads/main/obpas%20icon.png",
      altName: "obpasLogo",
      text: "Obpas",
    },
  ];

  // Responsive items calculation
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 480) {
        setItemsToShow(1);
      } else if (width < 640) {
        setItemsToShow(2);
      } else if (width < 900) {
        setItemsToShow(3);
      } else {
        setItemsToShow(4);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const maxIndex = Math.max(0, imagesList.length - itemsToShow);

  const handleNext = () => {
    if (currentIndex < maxIndex && !isAnimating) {
      setDirection('next');
      setIsAnimating(true);
      setCurrentIndex(currentIndex + 1);
      setTimeout(() => setIsAnimating(false), 400);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0 && !isAnimating) {
      setDirection('prev');
      setIsAnimating(true);
      setCurrentIndex(currentIndex - 1);
      setTimeout(() => setIsAnimating(false), 400);
    }
  };

  // Auto-slide functionality
  useEffect(() => {
    const interval = setInterval(() => {
      if (currentIndex < maxIndex) {
        setDirection('next');
        setIsAnimating(true);
        setCurrentIndex(prev => prev + 1);
        setTimeout(() => setIsAnimating(false), 400);
      } else {
        setDirection('prev');
        setIsAnimating(true);
        setCurrentIndex(0);
        setTimeout(() => setIsAnimating(false), 400);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [currentIndex, maxIndex]);

  return (
    <div className="top-section-parent">
      <div className="top-section-wrapper">
        <button 
          onClick={handlePrev} 
          className={`top-section-nav-btn top-section-nav-prev ${currentIndex === 0 ? 'disabled' : ''}`}
          disabled={currentIndex === 0}
        >
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M15.41 16.59L10.83 12L15.41 7.41L14 6L8 12L14 18L15.41 16.59Z" fill="currentColor"/>
          </svg>
        </button>

        <div className="top-section-slider-container" ref={containerRef}>
          <div 
            className={`top-section-slider ${isAnimating ? `sliding-${direction}` : ''}`}
            style={{ 
              transform: `translateX(-${currentIndex * (100 / itemsToShow)}%)`,
              width: `${(imagesList.length / itemsToShow) * 100}%`
            }}
          >
            {imagesList.map((item, index) => (
              <div 
                className="top-section-slide-item" 
                key={index}
                style={{ width: `${100 / imagesList.length}%` }}
              >
                <div className="top-section-logo-card">
                  <div className="top-section-logo-icon">
                    <img src={item.link} alt={item.altName} />
                  </div>
                  <p className="top-section-logo-text">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button 
          onClick={handleNext} 
          className={`top-section-nav-btn top-section-nav-next ${currentIndex >= maxIndex ? 'disabled' : ''}`}
          disabled={currentIndex >= maxIndex}
        >
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M8.59 16.59L13.17 12L8.59 7.41L10 6L16 12L10 18L8.59 16.59Z" fill="currentColor"/>
          </svg>
        </button>
      </div>

      {/* Pagination dots */}
      <div className="top-section-dots">
        {Array.from({ length: maxIndex + 1 }).map((_, index) => (
          <button
            key={index}
            className={`top-section-dot ${index === currentIndex ? 'active' : ''}`}
            onClick={() => {
              if (!isAnimating) {
                setDirection(index > currentIndex ? 'next' : 'prev');
                setIsAnimating(true);
                setCurrentIndex(index);
                setTimeout(() => setIsAnimating(false), 400);
              }
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default TopSection;