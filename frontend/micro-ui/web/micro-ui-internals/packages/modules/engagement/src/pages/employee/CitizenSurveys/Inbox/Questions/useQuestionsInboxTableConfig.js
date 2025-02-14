import React, { Fragment, useMemo, useState } from "react"
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import { DeleteIcon } from "@upyog/digit-ui-react-components";
const useQuestionsInboxTableConfig = ({ parentRoute, onPageSizeChange, formState, totalCount, table, dispatch, inboxStyles={},setShowToast }) => {
    const GetCell = (value) => <span className="cell-text styled-cell">{value}</span>;
    const GetStatusCell = (value) => value?.toLowerCase() === "active" ? <span className="sla-cell-success">{value}</span> : <span className="sla-cell-error">{value}</span>
    const { t } = useTranslation()

   //const [showToast,setToast]=useState(null);

  const handleDeleteConfirm=(row)=>{
    setShowToast({key:true,label:"Are you sure you want to delete?",warning:"Are you sure you want to delete?",isDeleteBtn:true,isWarningButtons:true,rowData:{row}})

  }
//    const handleDelete =(row)=>{
   
//     const updatedList = table.filter((_, idx) => idx !== row.index);
//     const details={
//         Categories:[ {
//            id: row.original?.id,
//            isActive: row.original?.isActive,
//           }
//         ]
//     }
//     try{
   
//         Digit.Surveys.deleteCategory(details).then((response) => {
//           if(response?.Categories?.length>0)
//           {
//             setTableData(updatedList)
//             setShowToast({ key: true, label: "Category sucessfully deleted" });
//           }
//           else
//           {
//             setShowToast({ key: true, label: `${response?.Errors?.message}` });
//           }
//         })
//       }
//       catch(error)
//       {
//         console.log(error);
//       }
//    }

    const tableColumnConfig = useMemo(() => {
        return [
            {
                Header: t("Category Name"),
                accessor: "label",
                Cell: ({ row }) => {
                    return (
                        <div>
                            {/* <Link to={`${parentRoute}/surveys/inbox/details/${row.original["uuid"]}`}> */}
                                <span >{row.original?.label}</span>
                            {/* </Link> */}
                        </div>
                    );
                },
            },

            {
                Header: t("Question"),
                accessor: "question",
                Cell: ({ row }) => {
                    return (
                        <div>
                            {/* <Link to={`${parentRoute}/surveys/inbox/details/${row.original["uuid"]}`}> */}
                                <span >{row.original?.question}</span>
                            {/* </Link> */}
                        </div>
                    );
                },
            },
                {
                            Header: t("Created On"),
                            accessor: "createdTime",
                            Cell: ({ row }) => row.original?.auditDetails?.createdTime ? GetCell(format(new Date(row.original?.auditDetails?.createdTime), 'dd/MM/yyyy')) : ""
                        },

                        {
                            Header: t("is Active"),
                            accessor: "isActive",
                            Cell: ({ row }) =>{    return (<div> <span>{(row.original?.isActive).toString()}</span></div>)}
                        },
                        {
                            Header: t("DELETE_KEY"),
                            accessor: "delete",
                            Cell: ({ row }) =>{    
                                return (
                                <button onClick={() => handleDeleteConfirm(row)}>
                                         <DeleteIcon className="delete" fill="#a82227" style={{ cursor: "pointer", marginLeft: "20px" }} />
                                       </button>
                                )
                            }
                        },
          
        ]
    })

    return {
        getCellProps: (cellInfo) => {
            return {
                style: {
                    padding: "20px 18px",
                    fontSize: "16px"
                }
            }
        },
        disableSort: false,
        autoSort: true,
        manualPagination: true,
        initSortI: "endDate",
        onPageSizeChange: onPageSizeChange,
        currentPage: parseInt(formState.tableForm?.offset / formState.tableForm?.limit),
        onNextPage: () => dispatch({ action: "mutateTableForm", data: { ...formState.tableForm, offset: (parseInt(formState.tableForm?.offset) + parseInt(formState.tableForm?.limit)) } }),
        onPrevPage: () => dispatch({ action: "mutateTableForm", data: { ...formState.tableForm, offset: (parseInt(formState.tableForm?.offset) - parseInt(formState.tableForm?.limit)) } }),
        pageSizeLimit: formState.tableForm?.limit,
        // onSort: onSort,
        // sortParams: [{id: getValues("sortBy"), desc: getValues("sortOrder") === "DESC" ? true : false}],
        totalRecords: parseInt(totalCount),
        onSearch: formState?.searchForm?.message,
        // globalSearch: {searchForItemsInTable},
        // searchQueryForTable,
        data: table,
        columns: tableColumnConfig,
        noResultsMessage:"No Category found",
        inboxStyles:{...inboxStyles}

        
    }
 
}

export default useQuestionsInboxTableConfig