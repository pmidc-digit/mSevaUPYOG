import { Loader, PDFSvg } from "@mseva/digit-ui-react-components";
import React from "react";
import { useTranslation } from "react-i18next";
import { pdfDownloadLink } from "../utils";


/* 
  ADSDocument Component

  This component is used for uploading and displaying documents.
  It fetches documents based on the provided type.
*/

function ADSDocument({ value = {}, Code, index, showFileName = false }) {
  const { t } = useTranslation();
  const isMobile = window.Digit.Utils.browser.isMobile();
  const { isLoading, isError, error, data } = Digit.Hooks.ads.useADSDocumentSearch({ value }, { value }, Code, index);
  // const PDFSvg = () => (
  //   <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  //     <rect width="24" height="24" rx="4" fill="#D32F2F" />
  //     <text x="0" y="16" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#FFFFFF">
  //       PDF
  //     </text>
  //   </svg>
  // );

  const PDFSvg = ({ width = 20, height = 20, style }) => (
    <svg style={style} xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 20 20" fill="gray">
      <path d="M20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8.5 7.5c0 .83-.67 1.5-1.5 1.5H9v2H7.5V7H10c.83 0 1.5.67 1.5 1.5v1zm5 2c0 .83-.67 1.5-1.5 1.5h-2.5V7H15c.83 0 1.5.67 1.5 1.5v3zm4-3H19v1h1.5V11H19v2h-1.5V7h3v1.5zM9 9.5h1v-1H9v1zM4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm10 5.5h1v-3h-1v3z" />
    </svg>
  );

  const documents = value?.documents
    ? value.documents.documents
        .filter((doc) => doc.documentType === Code)
        .map((doc) => ({ ...doc, documentType: doc.documentType.replace(/\./g, "_") }))
    : value.filter((doc) => doc.documentType === Code).map((doc) => ({ ...doc, documentType: doc.documentType.replace(/\./g, "_") }));
  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="document-container">

   
    <React.Fragment>
      <div className="document-grid">

    
      {documents.map((document, index) => {
        let documentLink = pdfDownloadLink(data.pdfFiles, document.fileStoreId);
        return (
          <a 
            className="document-link" 
            target="_blank"
            rel="noopener noreferrer"
            href={documentLink} 
            key={index}
          >
            <div className="document-card">
                  <div className="document-icon-wrapper">
                    <PDFSvg width={isMobile ? 50 : 80} height={isMobile ? 60 : 100} />
                  </div>
                  <p className="document-name" title={t(document?.documentType)}>
                    {(() => {
                      const text = t(document?.documentType);
                      const maxLength = isMobile ? 8 : 12;
                      return text?.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
                    })()}
                  </p>
                  <div className="document-action-label">
                    View
                  </div>
                </div>
          </a>
        );
      })}
      </div>
    </React.Fragment>
     </div>
  );
}

export default ADSDocument;
