import React, { useEffect, useState, useMemo } from "react";
import { ImageViewer, Card, CardSubHeader, CardSectionHeader } from "@mseva/digit-ui-react-components";
import { useTranslation } from "react-i18next";
import EXIF from "../utils/exif-compat";

const LayoutSitePhotographs = ({ documents, coordinates={} }) => {
  const { t } = useTranslation();

  const documentObj = {
    value: {
      workflowDocs: documents?.map((doc) => ({
        documentType: doc?.documentType || "",
        filestoreId: doc?.filestoreId || doc?.fileStoreId || "",
        documentUid: doc?.documentUid || doc?.fileStoreId || "",
        documentAttachment: doc?.documentAttachment || "",
      })),
    },
  };

  const { data: urlsList, isLoading: urlsListLoading } = Digit.Hooks.noc.useNOCDocumentSearch(documentObj, {
    enabled: documents?.length > 0 ? true : false,
  });

  const mappedDocuments = documents?.map((doc) => {
    const { documentUid, documentType, title, latitude, longitude } = doc;
    const url = urlsList?.pdfFiles?.[documentUid]; // Get URL using documentUid
    return {
      documentUid,
      documentType,
      url,
      title,
      latitude,
      longitude
    };
  });

  const documentsData = useMemo(() => {
    return mappedDocuments?.map((doc, index) => ({
      id: index,
      documentType: doc?.documentType,
      title: doc?.documentType !== "" ?  t(doc?.documentType?.replaceAll(".", "_")) : doc?.title !=="" ? doc?.title : t("CS_NA"),
      fileUrl: doc.url,
      latitude: doc.latitude,
      longitude: doc.longitude
    }));
  }, [mappedDocuments]);

  return (
    <div className="obps-page-components-layout-site-photographs--style-1">
      {documentsData?.map((item, index) => (
        <div key={index} className="obps-page-components-layout-site-photographs--style-2">
          <CardSectionHeader>{item?.title}</CardSectionHeader>

          <div className="obps-page-components-layout-site-photographs--style-3">
            <img
              src={item.fileUrl}
              alt={item.title}
              className="obps-page-components-layout-site-photographs--style-4"
              onClick={() => window.open(item.fileUrl, "_blank")}
            />
          </div>

          {item?.latitude && <div>Lat: {item.latitude}</div>}
          {item?.longitude && <div>Long: {item.longitude}</div>}

          {item.documentType === "OWNER.SITEPHOTOGRAPHONE" && <div>Latitude - {coordinates?.Latitude1}</div>}
          {item.documentType === "OWNER.SITEPHOTOGRAPHONE" && <div>Longitude - {coordinates?.Longitude1}</div>}
          {item.documentType === "OWNER.SITEPHOTOGRAPHTWO" && <div>Latitude - {coordinates?.Latitude2}</div>}
          {item.documentType === "OWNER.SITEPHOTOGRAPHTWO" && <div>Longitude - {coordinates?.Longitude2}</div>}
        </div>
      ))}
    </div>
  );
};

export default LayoutSitePhotographs;
