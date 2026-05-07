// import React from 'react';
// import { useTranslation } from "react-i18next";

// export const CustomLoader = ({ message }) => {
//     const { t } = useTranslation();
    
//     return (
//         <div className="loader-message">
//             <div className="body">
//                 <span>
//                     <span></span>
//                     <span></span>
//                     <span></span>
//                     <span></span>
//                     <span></span>
//                 </span>
//                 <div className="base">
//                     <span></span>
//                     <div className="face"></div>
//                 </div>
//             </div>

//             <div className="longfazers">
//                 <span></span>
//                 <span></span>
//                 <span></span>
//                 <span></span>
//             </div>

//             <div className="message">{t(message)}</div>
//         </div>
//     );
// };

import React from "react";
import { useTranslation } from "react-i18next";

export const CustomLoader = ({ message }) => {
  const { t } = useTranslation();

  return (
    <div className="custom-loader-overlay">
      <div className="custom-loader-spinner-wrapper">
        <div className="custom-loader-spinner" />
      </div>

      {message && (
        <div className="custom-loader-text">
          {t(message)} <DottedLoader />
        </div>
      )}
    </div>
  );
};

const DottedLoader = () => {
  const [dots, setDots] = React.useState(".");

  React.useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => {
        if (prev === ".") return "..";
        if (prev === "..") return "...";
        return ".";
      });
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return <span className="custom-loader-dots">{dots}</span>;
};

