import React, { useState, useEffect, useMemo } from "react";
import { Table, StatusTable, LinkButton, Loader } from "@mseva/digit-ui-react-components";
import { useTranslation } from "react-i18next";

const CLUDocumentTableView = ({ documents }) => {
  const { t } = useTranslation();

  function routeTo(jumpTo) {
    window.open(jumpTo, "_blank");
  }

  const documentsColumns = [
    {
      Header: t("SR_NO"),
      accessor: "srNo",
      width: "20px",
      Cell: ({ row }) => <div className="obps-page-components-cludocument-table-view--style-1">{row.index + 1}</div>,
    },
    {
      Header: t("BPA_DOCUMENT_NAME"),
      accessor: "title",
      Cell: ({ value }) => t(value) || t("CS_NA"),
    },
    {
      Header: t("BPA_DOCUMENT_FILE"),
      accessor: "fileUrl",
      Cell: ({ value }) =>
        value ? <LinkButton className="obps-page-components-cludocument-table-view--style-2" label={t("View")} onClick={() => routeTo(value)} /> : t("CS_NA"),
    },
  ];

  const documentObj = useMemo(() => {
    return {
      value: {
        workflowDocs: documents?.map((doc) => ({
          documentType: doc?.documentType || "",
          filestoreId: doc?.filestoreId || doc?.fileStoreId || "",
          documentUid: doc?.documentUid || doc?.fileStoreId || doc?.filestoreId || "",
          documentAttachment: doc?.documentAttachment || doc?.documentUid || doc?.fileStoreId || doc?.filestoreId || "",
        })),
      },
    };
  }, [documents]);

  console.log("documentsOBJ",documents, documentObj)

  const { data: urlsList, isLoading: urlsListLoading } = Digit.Hooks.noc.useNOCDocumentSearch(documentObj, {
    enabled: documents?.length > 0 ? true : false,
  });

  const mappedDocuments = documents?.map((doc) => {
    const docUid = doc?.documentUid || doc?.fileStoreId || doc?.filestoreId || "";
    const { documentType } = doc;
    const url = urlsList?.pdfFiles?.[docUid];
    return {
      documentUid: docUid,
      documentType,
      url,
    };
  });

  const documentsData = useMemo(() => {
    return mappedDocuments?.map((doc, index) => ({
      id: index,
      srNo: index + 1,
      title: t(doc?.documentType?.replaceAll(".", "_")) || t(doc?.documentType) || t("CS_NA"),
      fileUrl: doc.url,
    }));
  }, [mappedDocuments]);

  console.log("documents", documents, urlsList)

  if(urlsListLoading) return <Loader />

  return (
    <div className="obps-page-components-cludocument-table-view--style-3">
      {documentsData && (
        <Table
          className="customTable table-border-style obps-page-components-cludocument-table-view--style-4"
          t={t}
          data={documentsData}
          columns={documentsColumns}
          getCellProps={(cellInfo) => (cellInfo.column.id === "srNo" ? { style: { width: "20px", textAlign: "center" } } : {})}
          getHeaderProps={(column) => (column.id === "srNo" ? { style: { width: "20px", textAlign: "center" } } : {})}

          disableSort={true}
          autoSort={false}
          manualPagination={false}
          isPaginationRequired={false}
          pageSizeLimit={100}
          initialState={{ pageSize: 100 }}
        />
      )}
    </div>
  );
};

export default CLUDocumentTableView;
