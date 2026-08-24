import React, { useEffect } from 'react';
// this code shows the image and the detail of the advertisement

const AdvertisementModuleCard = ({ imageSrc, title, location, poleNo, price, path, light,adType,faceArea }) => {
  const [params, setParams,clearParams] = Digit.Hooks.useSessionStorage("ADS_CREATE", {});
  const handleViewAvailability = () => {
    setParams({
      faceArea:{code:faceArea,value:faceArea,i18nKey:faceArea},
      adType:{code:adType,value:adType,i18nKey:adType},
      location:{code:location,value:location,i18nKey:location},
      fromDate: new Date().toISOString().split("T")[0], // Current date
      toDate: new Date(new Date().setMonth(new Date().getMonth() + 2)).toISOString().split("T")[0], // 3 months later
      nightLight:{
        i18nKey: "Yes",
        code: "Yes",
        value: "true",
      }
    });
    window.location.href = `${path}bookad/searchads`;
  };
  useEffect(() => {
    clearParams();
  }, []);
  const handleBookNow = () => {
    setParams({
      faceArea:{code:faceArea,value:faceArea,i18nKey:faceArea},
      adType:{code:adType,value:adType,i18nKey:adType},
      location:{code:location,value:location,i18nKey:location},
      nightLight:{
        i18nKey: "Yes",
        code: "Yes",
        value: "true",
      }
    });
    window.location.href = `${path}bookad/searchads`;
  };
  return (
    <div
      className="ads-components-advertisement-module-card--style-1"
    >
      <div className="ads-components-advertisement-module-card--style-2">
        <img
          src={imageSrc}
          alt="Advertisement"
          className="ads-components-advertisement-module-card--style-3"
        />
      </div>
      <div className="ads-components-advertisement-module-card--style-4">
        <p className="ads-components-advertisement-module-card--style-5">{light}</p>
        <h3 className="ads-components-advertisement-module-card--style-6">{title}</h3>
        <p>
          {location} (
          <button type="button" className="ads-components-advertisement-module-card--style-7">
            View Map
          </button>
          )
        </p>
        <div className="ads-components-advertisement-module-card--style-8">
          <p>Pole No: {poleNo}</p>
          <p>₹ {price}</p>
        </div>
        <div className="ads-components-advertisement-module-card--style-9">
          <button
            type="button"
            onClick={handleViewAvailability}
            className="ads-components-advertisement-module-card--style-10"
          >
            View Availability
          </button>
          <button
            type="button"
            onClick={handleBookNow}
            className="ads-components-advertisement-module-card--style-11"
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
};
export { AdvertisementModuleCard };