import React, { useState, useEffect, useMemo } from "react";
import { CardLabel, LabelFieldPair, Dropdown, TextInput, LinkButton, DatePicker, CardSectionHeader, DeleteIcon, Table, Loader } from "@mseva/digit-ui-react-components";
import { useForm, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import _ from "lodash";
import { useLocation } from "react-router-dom";

const InspectionReportDisplay = ({fiReport}) => {
    const { t } = useTranslation();
  
    if (!fiReport || fiReport.length === 0) {
      return <div>{t("NO_INSPECTION_REPORTS_AVAILABLE")}</div>;
    }

  
    return (
      <div>
        {fiReport.map((report, index) => (
          <div key={index}>
            <CardSectionHeader>{fiReport.length > 1 ? `${t("BPA_FI_REPORT")}-${index + 1}` : `${t("BPA_FI_REPORT")}`}</CardSectionHeader>
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
            <div style={{ marginTop: "16px" }}>
              {/* <CardLabel className="card-label-smaller">{t("BPA_FI_CHECKLIST_LABEL")}:</CardLabel> */}
              {report.questionList && report.questionList.length > 0 ? (
                // report.questionList.map((questionItem, qIndex) => (
                //   <div key={qIndex}>
                //     <div>
                //       <strong>{questionItem.question}</strong>
                //     </div>
                //     <div>
                //       {t(report?.["question_"+qIndex]?.i18nKey)}
                //     </div>
                //     {report?.["Remarks_"+qIndex] && (
                //       <div>
                //         <em>{t("COMMENTS")}: {report?.["Remarks_"+qIndex]}</em>
                //       </div>
                //     )}
                //   </div>
                // ))
                        <Table
                            className="customTable table-border-style"
                            t={t}
                            data={report.questionList.map((item, idx) => ({
                                question: t(item?.question),
                                answer: t(report?.["question_" + idx]?.i18nKey),
                                remarks: report?.["Remarks_" + idx] || "-"
                            }))}
                            columns={[
                                {
                                    Header: t("BPA_CHECK_LIST_DETAILS"),
                                    accessor: "question"
                                },                                
                                {
                                    Header: t("BPA_REMARKS"),
                                    accessor: "remarks"
                                }
                            ]}
                            getCellProps={() => ({ style: {} })}
                            disableSort={false}
                            autoSort={true}
                            manualPagination={false}
                            isPaginationRequired={false}
                        />
              ) : (
                <div>{t("NA")}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  export default InspectionReportDisplay;