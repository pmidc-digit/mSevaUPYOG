import React, { Fragment, useMemo,useState } from "react";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import { DeleteIcon, EditIcon } from "@mseva/digit-ui-react-components";
const useCategoryInboxTableConfig = ({ parentRoute, onPageSizeChange, formState, totalCount, table, dispatch, inboxStyles = {}, setShowToast }) => {
  const GetCell = (value) => <span className="cell-text styled-cell">{value}</span>;
  const GetStatusCell = (value) =>
    value === true ? <span className="sla-cell-success">Active</span> : value === false ? <span className="sla-cell-error">Inactive</span> : "-";
  const { t } = useTranslation();
  const [showTooltip, setShowTooltip] = useState(false);
  // const handleDeleteConfirm = (row) => {
  // console.log("Current row: ", row);
  // const currentStatus = row?.original?.isActive;
  // setShowToast({
  //   label: "Are you sure you want to delete this category?",
  //   isDeleteBtn: true,
  //   warning: true,
  //   isWarningButtons: true,
  //   rowData: { row },
  // });
  //   });
  // };
  console.log("formState tableform",formState.tableForm)
  const handleUpdateCategoryConfirm = (row) => {
    console.log("Current row: ", row);
    const currentStatus = row?.original?.isActive?"Active":"Inactive";
    const updatedStatus= row?.original?.isActive?"Inactive":"Active";
    setShowToast({
      label: `Are you sure you want to change the category status of "${
        row?.original?.label
      }" from ${currentStatus} to ${updatedStatus}? Please confirm.`,
      isDeleteBtn: true,
      warning: true,
      isWarningButtons: true,
      rowData: row?.original ,
    });
  };

  const tableColumnConfig = useMemo(() => {
    return [
      {
        Header: t("Category"),
        accessor: "category",
        Cell: ({ row }) => {
          return (
            <div>
              {/* <Link to={`${parentRoute}/surveys/inbox/details/${row.original["uuid"]}`}> */}
              <span>{row.original?.label}</span>
              {/* </Link> */}
            </div>
          );
        },
      },
      {
        Header: t("Status"),
        accessor: "isActive",
        Cell: ({ row }) => GetStatusCell(row.original?.isActive),
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
      //   Header: t("Delete Category"),
      //   accessor: "deleteCategory",
      //   Cell: ({ row }) => {
      //     return (
      //       <button onClick={() => handleDeleteConfirm(row)}>
      //         <DeleteIcon className="delete" fill="#a82227" style={{ cursor: "pointer", marginLeft: "20px" }} />
      //       </button>
      //     );
      //   },
      // },
      {
        Header: t("Update Category Status"),
        accessor: "updateCategory",
        Cell: ({ row }) => {
          return (
            <button onClick={() => handleUpdateCategoryConfirm(row) } 
            onMouseEnter={() =>{ setShowTooltip(true);} }
            onMouseLeave={() => setShowTooltip(false)} 
            // style={{
            //   position: "relative",
            //   display: "inline-block",
            //   border: "none",
            //   background: "none",
            //   cursor: "pointer"
            // }}
            >

              <EditIcon className="table-cell-for-update" fill="#a82227" style={{ cursor: "pointer", marginLeft: "20px" }} />
              <span style={{ 
                visibility: showTooltip?"visible":"hidden",
                width: !showTooltip? "120px": null,
                backgroundColor: !showTooltip? "black":null,
                color: !showTooltip? "#fff":null,
                textAlign: !showTooltip? "center":null,
                borderRadius: !showTooltip? "5px":null,
                padding: !showTooltip?  "5px":null,
                position: !showTooltip? "absolute":null,
                zIndex: !showTooltip? "1":null,
                top: !showTooltip? "-125%":null, /* Position the tooltip above the icon */
                left: !showTooltip? "50%":null,
                marginLeft: !showTooltip? "-60px":null,
                opacity: showTooltip?1:0,
                transition: !showTooltip? "opacity 0.3s":null
               }}>
       Click here to update category status
      </span>
            </button>
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
    autoSort: true,
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
    noResultsMessage: "No Category found",
    inboxStyles: { ...inboxStyles },
  };
};

export default useCategoryInboxTableConfig;
