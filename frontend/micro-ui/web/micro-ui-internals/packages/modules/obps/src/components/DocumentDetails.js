import React, { Fragment, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { PDFSvg, Row } from "@mseva/digit-ui-react-components";

const DocumentDetails = ({ documents }) => {
  const { t } = useTranslation();
  const [filesArray, setFilesArray] = useState(() => []);
  const [pdfFiles, setPdfFiles] = useState({});

  if (documents?.length == 0) {
    return (
      <div className="obps-document-detail-no-doc">
        <p>{t("BPA_NO_DOCUMENTS_UPLOADED_LABEL")}</p>
      </div>
    );
  }
  useEffect(() => {
    let acc = [];
    documents?.forEach((element, index, array) => {
      acc = [...acc, element];
    });
    setFilesArray(acc?.map((value) => value?.filestoreIdArray.map((val) => val)));
  }, [documents]);

  useEffect(() => {
    if (filesArray?.length) {
      Digit.UploadServices.Filefetch(filesArray, Digit.ULBService.getStateId()).then((res) => {
        setPdfFiles(res?.data);
      });
    }
  }, [filesArray]);

  return (
    <Fragment>
      {documents?.map((document, docIndex) => (
        <Fragment>
          <Row
            className="obps-document-detail-row"
            labelStyle={{ paddingTop: "10px", width: "100%" }}
            label={t(document?.title?.split("_")?.slice(0, 2).join("_"))}
          />
          <div className="obps-document-detail-list">
            {document?.filestoreIdArray &&
              document?.filestoreIdArray.map((filestoreId, index) => (
                <div className="obps-document-detail-item">
                  <a className="obps-document-detail-link" target="_blank" href={pdfFiles[filestoreId]?.split(",")[0]} key={index}>
                    <div className="obps-document-detail-icon-wrapper">
                      <PDFSvg />
                    </div>
                    <p className="obps-document-detail-title">{t(document?.title)}</p>
                  </a>
                </div>
              ))}
          </div>
          {documents?.length != docIndex + 1 ? <hr className="obps-document-detail-divider" /> : null}
        </Fragment>
      ))}
    </Fragment>
  );
};

export default DocumentDetails;
