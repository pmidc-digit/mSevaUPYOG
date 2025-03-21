import React, {useState} from "react";

const MiddleSection = () => {
  const images = [
    "https://via.placeholder.com/300x150",
    "https://via.placeholder.com/300/0000FF",
    "https://via.placeholder.com/300/FF0000",
    "https://via.placeholder.com/300/00FF00",
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

  return (
    <div className="middle-section">
      <div className="middle-content">
        {/* Latest Projects */}
        <div className="middle-left-half">
          <div className="middle-left-half-upper">
            <div className="middle-header">Latest Projects</div>
            <div className="middle-left-half-upper-body">
              <ul>
                <li>
                  <a href="#">SMART CITY MISSION</a>
                </li>
                <li>
                  <a href="#">AMRUT</a>
                </li>
                <li>
                  <a href="#">SWACCH BHARAT MISSION</a>
                </li>
                <li>
                  <a href="#">SWM</a>
                </li>
              </ul>
            </div>
          </div>

          {/* Photo Gallery with Navigation */}
          <div className="middle-left-half-lower">
            <div className="middle-header">Photo Gallery</div>
            <div className="photo-gallery">
              <img
                src={images[currentIndex]}
                alt={`Slide ${currentIndex}`}
                className="gallery-image"
              />
              <button className="gallery-btn left" onClick={handlePrev}>
                &#8249;
              </button>
              <button className="gallery-btn right" onClick={handleNext}>
                &#8250;
              </button>
            </div>
          </div>
        </div>

        {/* News Highlights */}
        <div className="middle-right-half">
          <div className="middle-header">News Highlights</div>
          <div className="middle-right-body">
            <div className="middle-image-section">
              <img
                src="https://www.dreamstime.com/stock-images-news-woodn-dice-depicting-letters-bundle-small-newspapers-leaning-left-dice-image34802664"
                alt="News"
                className="news-image"
              />
            </div>
            <div className="middle-right-content-section">
              <ul>
                <li>
                  PMIDC is a non-profit organization to uplift urban living
                  standards.
                </li>
                <li>
                  Chief Secretary is the Chairman and Principal Secretary.
                </li>
                <li>Government initiatives for better urban development.</li>
                <li>Government initiatives for better urban development.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MiddleSection;
