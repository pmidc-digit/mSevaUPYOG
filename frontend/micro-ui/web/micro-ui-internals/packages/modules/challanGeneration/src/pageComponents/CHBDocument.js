import { Loader, PDFSvg } from "@mseva/digit-ui-react-components";
import React from "react";
import { useTranslation } from "react-i18next";
import { pdfDownloadLink } from "../utils";

function CHBDocument({ value = {}, Code, index, showFileName = false }) {
  const { t } = useTranslation();
  const { isLoading, isError, error, data } = Digit.Hooks.chb.useChbDocumentSearch({ value }, { value }, Code, index);

  const documents = value?.documents ?
  value.documents.documents.
  filter((doc) => doc.documentType === Code).
  map((doc) => ({ ...doc, documentType: doc.documentType.replace(/\./g, "_") })) :
  value.filter((doc) => doc.documentType === Code).map((doc) => ({ ...doc, documentType: doc.documentType.replace(/\./g, "_") }));
  if (isLoading) {
    return <Loader />;
  }

  console.log("Code", Code);

  return (
    <div className="document-container">
      <React.Fragment>
        <div className="document-grid">
          {documents.map((document, index) => {
            let documentLink = pdfDownloadLink(data.pdfFiles, document.fileStoreId);
            return (
              <a className="document-link challan-generation-style-1cf294634a" target="_" href={documentLink} key={index}>
               <div className="document-icon-wrapper">
                  <PDFSvg width={80} height={100} />
                </div>

                {showFileName ?
                <p className="document-name challan-generation-style-b1ecc496e0" title={t("CHB_" + Code?.split('.').slice(0, 2).join('_'))}>
                    {(() => {
                    const text = t(Code?.split('.').slice(0, 2).join('_'));
                    return text?.length > 6 ? `${text.substring(0, 6)}...` : text;
                  })()}
                  </p> :
                null}
              </a>);

          })}
        </div>
      </React.Fragment>
    </div>);

}

export default CHBDocument;
