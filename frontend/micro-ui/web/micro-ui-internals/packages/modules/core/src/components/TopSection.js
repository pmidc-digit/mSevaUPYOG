import React,{useState} from 'react';

const TopSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

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

  const handleNext = () => {
    if (currentIndex < imagesList.length - 4) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <div className="top-section-parent">
      <div className="top-section">
        <button onClick={handlePrev} className="nav-button">
          {"<"}
        </button>
        {imagesList.slice(currentIndex, currentIndex + 4).map((item, index) => (
          <div className="logo-box" key={index}>
            <img src={item.link} alt={item.altName} className="logo" />
            <p className="logo-text">{item.text}</p>
          </div>
        ))}
        <button onClick={handleNext} className="nav-button">
          {">"}
        </button>
      </div>
    </div>
  );
};

export default TopSection;