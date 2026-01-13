import { CardText, Loader, PDFSvg } from "@mseva/digit-ui-react-components";
import React from "react";
import { useTranslation } from "react-i18next";
import { pdfDocumentName, pdfDownloadLink, getDocumentsName, stringReplaceAll } from "../utils";


function OBPSDocument({
  value = {},
  Code,
  index,
  isNOC = false,
  svgStyles = { width: "100px", height: "100px", viewBox: "0 0 25 25", minWidth: "100px" },
  isStakeHolder = false,
}) {
  const { t } = useTranslation();
  const { isLoading, isError, error, data } = Digit.Hooks.obps.useOBPSDocumentSearch(
    {
      value,
    },
    { value },
    Code,
    index,
    isNOC
  );
  let documents = [];

  if (isNOC) {
    value?.nocDocuments
      ? value?.nocDocuments?.nocDocuments.length > 0 &&
        value?.nocDocuments?.nocDocuments
          .filter((ob) => ob?.documentType?.includes(Code))
          .map((ob) => {
            documents.push(ob);
          })
      : value?.length > 0 &&
        value
          ?.filter((ob) => ob?.documentType?.includes(Code))
          .map((ob) => {
            documents.push(ob);
          });
  } else {
    value?.documents
      ? value?.documents?.documents
          .filter((doc) => doc?.documentType === Code /* || doc?.documentType?.includes(Code.split(".")[1]) */)
          .map((ob) => {
            documents.push(ob);
          })
      : value
          .filter((doc) => doc?.documentType === Code /* || doc?.documentType.includes(Code.split(".")[1]) */)
          .map((ob) => {
            documents.push(ob);
          });
  }

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="document-container">
      <React.Fragment>
        {documents.length > 0 ? (
          <div className="document-grid">
            {documents?.map((document, index) => {
              let documentLink = pdfDownloadLink(data.pdfFiles, document?.fileStoreId);
              return (
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href={documentLink}
                  className="document-link"
                  key={index}
                >
                  <div className="document-card">
                    <div className="document-icon-wrapper">
                      <PDFSvg width={80} height={100} />
                    </div>
                    <p className="document-name">
                      {isStakeHolder 
                        ? t(`BPAREG_HEADER_${stringReplaceAll(Code?.toUpperCase(), ".", "_")}`)
                        : t(Code)
                      }
                    </p>
                    <div className="document-action-label">
                      View
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        ) : (
          <div className="document-empty-state">
            {t("BPA_NO_DOCUMENTS_UPLOADED_LABEL")}
          </div>
        )}
      </React.Fragment>
    </div>
  );
}

export default OBPSDocument;
