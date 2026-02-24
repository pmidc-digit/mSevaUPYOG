import React, { Fragment, useMemo } from "react";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import { DeleteIcon, EditIcon } from "@mseva/digit-ui-react-components";

const useQuestionsInboxTableConfig = ({
  parentRoute,
  onPageSizeChange,
  formState,
  totalCount,
  table,
  dispatch,
  inboxStyles = {},
  setShowToast,
  setOpenQuesDetailsDialog,
  setQuestionDetailsContent,
}) => {
  const GetCell = (value) => <span className="cell-text styled-cell">{value}</span>;
  const GetStatusCell = (value) => <span className={value === "ACTIVE" ? "sla-cell-success" : "sla-cell-error"}>{value}</span>;
  const { t } = useTranslation();

  // const handleDeleteConfirm = (row) => {
  // console.log("Current row: ", row);
  // const currentStatus = row?.original?.isActive;
  // setShowToast({
  //   label: "Are you sure you want to delete this question?",
  //   isDeleteBtn: true,
  //   warning: true,
  //   isWarningButtons: true,
  //   rowData: { row },
  // });
  //   });
  // };

  const handleUpdateQuestionConfirm = (row) => {
    //console.log("Current row: ", row);
    const currentStatus = row?.original?.status;
    const updatedStatus = currentStatus === "ACTIVE" ? "INACTIVE" : currentStatus === "INACTIVE" ? "ACTIVE" : "";

    setShowToast({
      label: `Are you sure you want to change the question status from ${currentStatus} to ${updatedStatus}? Please confirm.`,
      isDeleteBtn: true,
      warning: true,
      isWarningButtons: true,
      rowData: row?.original,
      updatedStatus: updatedStatus,
    });
  };

  function handleDisplayQuesDetails(question) {
    console.log("question: ", question);
    setOpenQuesDetailsDialog(true);
    const content = (
      <div>
        <fieldset>
          <legend style={{ fontWeight: "bold" }}>Question:</legend>
          <p>{question?.questionStatement}</p>
        </fieldset>
        <fieldset>
          <legend style={{ fontWeight: "bold" }}>Category:</legend>
          <p>{question?.category?.label}</p>
        </fieldset>
        <fieldset>
          <legend style={{ fontWeight: "bold" }}>Question Type:</legend>
          <p>{t(question?.type)}</p>
        </fieldset>
        {(question?.type === "MULTIPLE_ANSWER_TYPE" || question?.type === "CHECKBOX_ANSWER_TYPE") && (
          <fieldset>
            <legend style={{ fontWeight: "bold" }}>Options:</legend>
            {question?.options.map((option, index) => {
              return (
                <li key={option.uuid}>
                  {index + 1}. {option?.optionText}
                </li>
              );
            })}
          </fieldset>
        )}
        {/* <div>
    Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur? At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores.
    </div> */}
      </div>
    );
    setQuestionDetailsContent(content);
  }

  const tableColumnConfig = useMemo(() => {
    return [
      {
        Header: t("Question"),
        accessor: "questionStatement",
        Cell: ({ row }) => {
          return (
            <div className="tooltip">
              <div style={{ display: "flex", gap: "0 4px" }}>
                <div style={{ cursor: "pointer" }} onClick={() => handleDisplayQuesDetails(row?.original)}>
                  {row?.original?.questionStatement}
                </div>
                <span
                  className="tooltiptext"
                  style={{
                    top: "40%", // override bottom positioning to show below
                    bottom: "auto",
                    left: "50%",
                    marginLeft: "-10px",
                    fontSize: "medium",
                    position: "absolute",
                  }}
                >
                  {t("Click here to view the question details")}
                </span>
              </div>
            </div>
          );
        },
      },
      {
        Header: t("Is Question Active"),
        accessor: "isActive",
        Cell: ({ row }) => GetStatusCell(row.original?.status),
      },
      {
        Header: t("Question Type"),
        accessor: "questionType",
        Cell: ({ row }) => {
          return (
            <div>
              <span>{t(row.original?.type)}</span>
            </div>
          );
        },
      },
      // removed
      // {
      //   Header: t("Is Question Required"),
      //   accessor: "isQuestionRequired",
      //   Cell: ({ row }) => {
      //     return (
      //       <div>
      //         <span>{t(row.original?.required)}</span>
      //       </div>
      //     );
      //   },
      // },
      {
        Header: t("Category"),
        accessor: "category",
        Cell: ({ row }) => {
          return (
            <div>
              <span>{row.original?.category?.label}</span>
            </div>
          );
        },
      },
      {
        Header: t("Created On"),
        accessor: "createdTime",
        Cell: ({ row }) =>
          row.original?.auditDetails?.createdTime ? GetCell(format(new Date(row.original?.auditDetails?.createdTime), "dd/MM/yyyy")) : "",
      },
      {
        Header: t("Last Updated On"),
        accessor: "updatedTime",
        Cell: ({ row }) =>
          row.original?.auditDetails?.lastModifiedTime ? GetCell(format(new Date(row.original?.auditDetails?.lastModifiedTime), "dd/MM/yyyy")) : "",
      },
      // {
      //   Header: t("Delete Question"),
      //   accessor: "deleteQuestion",
      //   Cell: ({ row }) => {
      //     return (
      //       <button onClick={() => handleDeleteConfirm(row)}>
      //         <DeleteIcon className="delete" fill="#a82227" style={{ cursor: "pointer", marginLeft: "20px" }} />
      //       </button>
      //     );
      //   },
      // },
      {
        Header: t("Update Question Status"),
        accessor: "updateQuestion",
        Cell: ({ row }) => {
          return (
            <div className="tooltip" /* style={{position:"relative"}} */>
              <div style={{ display: "flex", /* alignItems: "center", */ gap: "0 4px" }}>
                <button onClick={() => handleUpdateQuestionConfirm(row)}>
                  <EditIcon className="table-cell-for-update" fill="#a82227" style={{ cursor: "pointer", marginLeft: "20px" }} />
                </button>
                <span className="tooltiptext" style={{ position: "absolute", width: "100px", marginLeft: "50%", fontSize: "medium" }}>
                  {t("Click here to update the question status")}
                </span>
              </div>
            </div>
          );
        },
      },
    ];
  });

  return {
    getCellProps: (cellInfo) => {
      return {
        style: {
          padding: "20px 18px",
          fontSize: "16px",
        },
      };
    },
    disableSort: false,
    autoSort: false,
    manualPagination: true,
    initSortI: "endDate",
    onPageSizeChange: onPageSizeChange,
    currentPage: parseInt(formState.tableForm?.offset / formState.tableForm?.limit),
    onNextPage: () =>
      dispatch({
        action: "mutateTableForm",
        data: { ...formState.tableForm, offset: parseInt(formState.tableForm?.offset) + parseInt(formState.tableForm?.limit) },
      }),
    onPrevPage: () =>
      dispatch({
        action: "mutateTableForm",
        data: { ...formState.tableForm, offset: parseInt(formState.tableForm?.offset) - parseInt(formState.tableForm?.limit) },
      }),
    pageSizeLimit: formState.tableForm?.limit,
    // onSort: onSort,
    // sortParams: [{id: getValues("sortBy"), desc: getValues("sortOrder") === "DESC" ? true : false}],
    totalRecords: parseInt(totalCount),
    onSearch: formState?.searchForm?.message,
    // globalSearch: {searchForItemsInTable},
    // searchQueryForTable,
    data: table,
    columns: tableColumnConfig,
    noResultsMessage: "No Question found",
    inboxStyles: { ...inboxStyles },
  };
};

export default useQuestionsInboxTableConfig;
