import React, {useState, useEffect, useMemo} from 'react'
import { Table, StatusTable, LinkButton } from '@mseva/digit-ui-react-components'
import { useTranslation } from "react-i18next";

const LayoutDocumentView = ({documents}) => {
  const { t } = useTranslation();

  console.log("=== LayoutDocumentView Debug ===")
  console.log("documents prop:", documents)

  function routeTo(jumpTo) {
    window.open(jumpTo, "_blank");
  }

 const documentsColumns = [
        {
          Header: t("BPA_DOCUMENT_NAME"),
          accessor: "title",
          Cell: ({ value }) => t(value) || t("CS_NA"),
        },
        {
          Header: t(""),
          accessor: "fileUrl",
          Cell: ({ value }) =>
            value ? (
              <LinkButton style={{ float: "right", display: "inline" }}
                label={t("View")}
                onClick={() => routeTo(value)}
              />
            ) : (
              t("CS_NA")
            ),
        },
  ];

 // Map documents - handle both uuid and documentUid for compatibility
 const documentObj = {
  value: {
    workflowDocs: documents?.map(doc => ({
      documentType: doc?.documentType || "",
      filestoreId: doc?.filestoreId || doc?.uuid || "",
      documentUid: doc?.documentUid || doc?.uuid || "",
      documentAttachment: doc?.documentAttachment || doc?.uuid || ""
    }))
   }
  };

  console.log("documentObj for hook:", documentObj)

 const { data: urlsList, isLoading: urlsListLoading } = Digit.Hooks.obps.useLayoutDocumentSearch(
    documentObj,
    {
      enabled: documents?.length > 0 ? true : false
    }
  );

  console.log("urlsList from hook:", urlsList)
  
  const mappedDocuments = documents?.map(doc => {
   // Use uuid or documentUid as the key
   const docId = doc?.documentUid || doc?.uuid;
   const { documentType } = doc;
   const url = urlsList?.pdfFiles?.[docId]; 
   return {
    documentUid: docId,
    documentType,
    url
  };
  });

  console.log("mappedDocuments:", mappedDocuments)

  const documentsData = useMemo(() => {
     return (mappedDocuments)?.map((doc, index) => ({
      id: index,
      title: t(doc?.documentType?.replaceAll(".", "_")) || t("CS_NA"),
      fileUrl: doc.url,
     }));
    }, [mappedDocuments]);

  console.log("documentsData for table:", documentsData)

  return (
    <div>
      {documentsData && documentsData.length > 0 && 
        <Table
          className="customTable table-border-style"
          t={t}
          data={documentsData}
          columns={documentsColumns}
          getCellProps={() => ({ style: {} })}
          disableSort={false}
          autoSort={true}
          manualPagination={false}
          isPaginationRequired={false}
        />
      }
      {(!documentsData || documentsData.length === 0) && (
        <div style={{ padding: "16px", textAlign: "center", color: "#666" }}>
          {t("NO_DOCUMENTS_UPLOADED") || "No documents uploaded"}
        </div>
      )}
    </div>
  )
}

export default LayoutDocumentView