import { CardSectionHeader, CardText, Loader, PDFSvg, StatusTable } from "@mseva/digit-ui-react-components";
import React from "react";
import { useTranslation } from "react-i18next";

function Document({ docs = [] }) {
  const { t } = useTranslation();

  return (
    <div className="obps-page-components-obpsdocuments-holder--style-1">
      <React.Fragment>
        <div className="obps-page-components-obpsdocuments-holder--style-2">
          {docs.length > 0 ? (
            <div className="obps-page-components-obpsdocuments-holder--style-3">
              {docs?.map((document, index) => {
                let documentLink = document?.fileURL;
                return (
                  <a
                    target="_blank"
                    rel="noreferrer"
                    href={documentLink}
                    className="obps-page-components-obpsdocuments-holder--style-4"
                    key={index}
                  >
                    <div className="obps-page-components-obpsdocuments-holder--style-5">
                      <PDFSvg />
                    </div>
                    <p className="obps-page-components-obpsdocuments-holder--style-6">{`${t(document?.documentType)}`}</p>
                  </a>
                );
              })}
            </div>
          ) : (
            <CardText>{t("BPA_NO_DOCUMENTS_UPLOADED_LABEL")}</CardText>
          )}
        </div>
      </React.Fragment>
    </div>
  );
}

const OBPSDocumentsHolder = ({ documents = [] }) => {
  const { t } = useTranslation();
  const { data, isLoading, error } = Digit.Hooks.useDocumentSearch(
    documents.map((doc) => {
      return { ...doc, docCategory: doc?.additionalDetails?.category || doc?.documentType.split(".").slice(0, 2).join("_") };
    })
  );

  if (isLoading) {
    return <Loader />;
  }
  let consolidatedDocObject = data?.pdfFiles?.reduce((acc, curr) => {
    if (acc[curr.docCategory]) {
      acc[curr.docCategory].push(curr);
    } else {
      acc[curr.docCategory] = [curr];
    }
    return { ...acc };
  }, {})||{};
  return (
    <React.Fragment>
      {Object.keys(consolidatedDocObject)?.map((category, index) => (
        <div key={index}>
          <div>
            <CardSectionHeader>{`${t(category)}`}</CardSectionHeader>
            <StatusTable>
              <Document key={index} docs={consolidatedDocObject[category]} />
              <hr className="obps-page-components-obpsdocuments-holder--style-7" />
            </StatusTable>
          </div>
        </div>
      ))}
    </React.Fragment>
  );
};

export default OBPSDocumentsHolder;
