import React, { useEffect, useState, useMemo } from "react";
import { ImageViewer, Card, CardSubHeader, CardSectionHeader } from "@mseva/digit-ui-react-components";
import { useTranslation } from "react-i18next";

const CLUSitePhotographs = ({ documents, coordinates }) => {
  const { t } = useTranslation();

  const documentObj = {
    value: {
      workflowDocs: documents?.map((doc) => ({
        documentType: doc?.documentType || "",
        filestoreId: doc?.filestoreId || "",
        documentUid: doc?.documentUid || "",
        documentAttachment: doc?.documentAttachment || "",
      })),
    },
  };

  const { data: urlsList, isLoading: urlsListLoading } = Digit.Hooks.noc.useNOCDocumentSearch(documentObj, {
    enabled: documents?.length > 0 ? true : false,
  });

  const mappedDocuments = documents?.map((doc) => {
    const { documentUid, documentType } = doc;
    const url = urlsList?.pdfFiles?.[documentUid]; // Get URL using documentUid
    return {
      documentUid,
      documentType,
      url,
    };
  });

  const documentsData = useMemo(() => {
    return mappedDocuments?.map((doc, index) => ({
      id: index,
      documentType: doc?.documentType,
      title: t(doc?.documentType?.replaceAll(".", "_")) || t(doc?.documentType) || t("CS_NA"),
      fileUrl: doc.url,
    }));
  }, [mappedDocuments]);

  return (
    <div style={{ padding: "50px 0px", display: "flex", justifyContent: "space-evenly" }}>
      {documentsData?.map((item, index) => (
        <div key={index} style={{ display: "flex", flexDirection: "column", width: "200px", height: "200px", alignItems: "center" }}>
          <CardSectionHeader>{t(item?.documentType?.replaceAll(".", "_"))}</CardSectionHeader>

          <div style={{ margin: "5px" }}>
            <img
              src={item.fileUrl}
              alt={item.title}
              style={{ width: "120px", height: "120px", objectFit: "fill", borderRadius: "10%", cursor: "pointer" }}
              onClick={() => window.open(item.fileUrl, "_blank")}
            />
          </div>

          <div>Latitude - {item.documentType === "OWNER.SITEPHOTOGRAPHONE" ? coordinates?.Latitude1 : coordinates?.Latitude2}</div>
          <div>Longitude - {item.documentType === "OWNER.SITEPHOTOGRAPHONE" ? coordinates?.Longitude1 : coordinates?.Longitude2}</div>
        </div>
      ))}
    </div>
  );
};

export default CLUSitePhotographs;
