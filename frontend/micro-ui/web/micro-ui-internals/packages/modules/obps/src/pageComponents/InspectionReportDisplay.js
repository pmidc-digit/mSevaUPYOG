import React, { useState, useEffect, useMemo } from "react";
import { CardLabel, LabelFieldPair, Dropdown, TextInput, LinkButton, DatePicker, CardSectionHeader, DeleteIcon, Table, Loader } from "@mseva/digit-ui-react-components";
import { useForm, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import _ from "lodash";
import { useLocation } from "react-router-dom";

const InspectionReportDisplay = ({fiReport}) => {
    const { t } = useTranslation();

    const report = useMemo(() => {
      if (fiReport && fiReport.length > 0) {
        return fiReport[0]; // Display the first report for now
      }
      return null;
    }, [fiReport]);

    // const tableData = useMemo(() => {
    //   if (report?.questionList?.length > 0) {
    //     return [...report.questionList]
    //       .sort((a, b) => {
    //         const getIndex = (q) =>
    //           Number(q?.question?.split("_").pop()) || 0;

    //         return getIndex(a) - getIndex(b);
    //       })
    //       .map((item, idx) => ({
    //         question: t(item?.question),
    //         remarks: report?.["Remarks_" + idx] || "-"
    //       }));
    //   }
    //   return [];
    // }, [report, t]);

  const tableData = useMemo(() => {
    if (report?.questionList?.length > 0) {
      const rows = [...report.questionList]
        .sort((a, b) => {
          const getIndex = (q) =>
            Number(q?.question?.split("_").pop()) || 0;

          return getIndex(a) - getIndex(b);
        })
        .map((item, idx) => {
          const questionText = t(item?.question) || t("CS_NA");
          const cleanedQuestion = questionText.replace(/^[\d\s.:]+/, '').trim();
          return {
            srNo: idx + 1,
            question: cleanedQuestion,
            remarks: report?.["Remarks_" + idx] || "-"
          };
        });

      // ➕ Add Recommendations row
      rows.push({
        srNo: rows.length + 1,
        question: t("BPA_RECOMMENDATIONS"),
        remarks: report?.Recommendations || "-"
      });

      return rows;
    }

    return [];
  }, [report, t]);
  
    if (!fiReport || fiReport.length === 0) {
      return <div>{t("BPA_NO_INSPECTION_REPORTS_AVAILABLE_LABEL")}</div>;
    }

  
    return (
      <div>
        {/* {fiReport.map((report, index) => ( */}
          {/* <div key={index}> */}
            {/* <CardSectionHeader>{fiReport.length > 1 ? `${t("BPA_FI_REPORT")}-${index + 1}` : `${t("BPA_FI_REPORT")}`}</CardSectionHeader> */}
            {/* {<LabelFieldPair>
              <CardLabel className="card-label-smaller">{`${t("BPA_FI_DATE_LABEL")}: `}</CardLabel>
              <div className="field" style={{ width: "100%" }}>
                {report?.InspectionDate || t("NA")}
              </div>
            </LabelFieldPair>}
            {report?.InspectionTime && <LabelFieldPair >
              <CardLabel className="card-label-smaller">{`${t("BPA_FI_TIME_LABEL")}: `}</CardLabel>
              <div className="field">
                {report?.InspectionTime || t("NA")}
              </div>
            </LabelFieldPair>} */}
            <div className="bpa-table-container">
              {tableData && tableData.length > 0 ? (
                <table className="customTable table-border-style">
                  <thead>
                    <tr>
                      <th style={{ width: "100px" }}>{t("SR_NO")}</th>
                      <th>{t("BPA_CHECK_LIST_DETAILS")}</th>
                      <th>{t("BPA_REMARKS")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.map((row, index) => (
                      <tr key={index}>
                        <td style={{ width: "100px" }}>{row.srNo}</td>
                        <td>{row.question}</td>
                        <td>{row.remarks}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div>{t("NA")}</div>
              )}
            </div>
          {/* </div> */}
        {/* ))} */}
      </div>
    );
  };
  
  export default InspectionReportDisplay;