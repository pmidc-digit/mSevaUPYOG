// import { Header } from "@mseva/digit-ui-react-components";
// import React from "react";
// import { useTranslation } from "react-i18next";
// //import SearchApplication from "../components/inbox/search";

// const HRMSEmployeewiseReport = () => {
//   const { t } = useTranslation();
//   // const getSearchFields = () => {
//   //   return [
//   //     {
//   //       type: "component",
//   //       component: "SelectULB",
//   //       key: "SelectULB",
//   //       label: t("HR_ULB_LABEL"),
//   //     },
//   //     // {
//   //     //   label: t("HR_NAME_LABEL"),
//   //     //   name: "names",
//   //     // },
//   //     // {
//   //     //   label: t("HR_MOB_NO_LABEL"),
//   //     //   name: "phone",
//   //     //   maxlength: 10,
//   //     //   pattern: "[6-9][0-9]{9}",
//   //     //   title: t("ES_SEARCH_APPLICATION_MOBILE_INVALID"),
//   //     //   componentInFront: "+91",
//   //     // },
//   //     // {
//   //     //   label: t("HR_EMPLOYEE_ID_LABEL"),
//   //     //   name: "codes",
//   //     // },
//   //   ];
//   // };
//   return (
//     <div>
//       <Header>{t("HR_HRMS_EMPLOYEE_REPORT_HEADING")}</Header>
//     </div>
//   );
// };

// export default HRMSEmployeewiseReport;

// import { Header} from "@mseva/digit-ui-react-components";
// import React, { useState, useEffect } from "react";
// import { Dropdown, SubmitBar, Table, Card } from "@mseva/digit-ui-react-components";
// import { useTranslation } from "react-i18next";
// // import { saveAs } from "file-saver";
// // import XLSX from "xlsx";
// // import pdfMake from "pdfmake/build/pdfmake";
// // import pdfFonts from "pdfmake/build/vfs_fonts";

// // pdfMake.vfs = pdfFonts.pdfMake.vfs;

// const HRMSEmployeewiseReport = () => {
//   const { t } = useTranslation();
//   const [ulb, setUlb] = useState(null);
//   const [ulbOptions, setUlbOptions] = useState([]);
//   const [data, setData] = useState([]);
//   const [searchInput, setSearchInput] = useState("");

//   useEffect(() => {
//     // Fetch ULB options on page load
//     fetch("/api/ulb-options")
//       .then((response) => response.json())
//       .then((data) => setUlbOptions(data));
//   }, []);

//   const handleSearch = () => {
//     // Fetch data based on selected ULB
//     fetch(`/api/data?ulb=${ulb}`)
//       .then((response) => response.json())
//       .then((data) => setData(data));
//   };

//   const handleReset = () => {
//     setUlb(null);
//     setData([]);
//     setSearchInput("");
//   };

//   // const handleDownload = (format) => {
//   //   if (format === "pdf") {
//   //     const docDefinition = {
//   //       content: [
//   //         {
//   //           table: {
//   //             headerRows: 1,
//   //             widths: ["auto", "*", "*", "*", "*", "*", "*", "*", "*"],
//   //             body: [
//   //               ["S. No", "Name", "Mobile Number", "Tenant ID", "Role Assigned", "User ID", "Department Name", "Designation Name", "Status"],
//   //               ...data.map((row, index) => [
//   //                 index + 1,
//   //                 row.name,
//   //                 row.mobilenumber,
//   //                 row.tenantid,
//   //                 row.role_assigned,
//   //                 row.user_id,
//   //                 row.departmentname,
//   //                 row.designationname,
//   //                 row.status,
//   //               ]),
//   //             ],
//   //           },
//   //         },
//   //       ],
//   //     };
//   //     pdfMake.createPdf(docDefinition).download("table.pdf");
//   //   } else if (format === "xls") {
//   //     const worksheet = XLSX.utils.json_to_sheet(data);
//   //     const workbook = XLSX.utils.book_new();
//   //     XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
//   //     XLSX.writeFile(workbook, "table.xlsx");
//   //   }
//   // };

//   return (
//     <div>
//       <Header>{t("HR_HRMS_EMPLOYEE_REPORT_HEADING")}</Header>
//       <Card>
//         <Dropdown options={ulbOptions} selected={ulb} onChange={setUlb} placeholder="Select ULB" />
//         <SubmitBar onClick={handleSearch}>Search</SubmitBar>
//         <SubmitBar onClick={handleReset}>Reset</SubmitBar>
//       </Card>
//       <div>
//         {/* <TextInput value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Search in table" /> */}
//         {/* <SubmitBar onClick={() => handleDownload("pdf")}>Download PDF</SubmitBar>
//         <SubmitBar onClick={() => handleDownload("xls")}>Download XLS</SubmitBar> */}
//       </div>
//       {/* <Table
//         data={data}
//         columns={[
//           { Header: "S. No", accessor: (row, i) => i + 1 },
//           { Header: "Name", accessor: "name" },
//           { Header: "Mobile Number", accessor: "mobilenumber" },
//           { Header: "Tenant ID", accessor: "tenantid" },
//           { Header: "Role Assigned", accessor: "role_assigned" },
//           { Header: "User ID", accessor: "user_id" },
//           { Header: "Department Name", accessor: "departmentname" },
//           { Header: "Designation Name", accessor: "designationname" },
//           { Header: "Status", accessor: "status" },
//         ]}
//       /> */}
//     </div>
//   );
// };

// export default HRMSEmployeewiseReport;

// import React, { useState } from "react";
// import { CardLabel, Dropdown, Header, LabelFieldPair, SearchField, SubmitBar } from "@mseva/digit-ui-react-components";
// import { useTranslation } from "react-i18next";
// import { SearchForm } from "@mseva/digit-ui-react-components";

// const HRMSEmployeewiseReport = () => {
//   const { t } = useTranslation();
//   const [selectedUlb, setSelectedUlb] = useState("");
//   const ulbOptions = [
//     { code: "ulb1", active: true },
//     { code: "ulb2", active: true },
//   ];
//   function HandleUlbChange(value) {
//     setSelectedUlb(value);
//   }
//   return (
//     <div>
//       <Header>{t("HR_HRMS_EMPLOYEE_REPORT_HEADING")}</Header>
//       <SearchForm onSubmit={() => {}} handleSubmit={() => {}}>
//         {/* <LabelFieldPair> */}
//         {/* <CardLabel className="card-label-smaller">
//             {t(input.label)}
//           </CardLabel> */}
//         <Dropdown
//           className="form-field"
//           selected={selectedUlb}
//           option={ulbOptions}
//           select={HandleUlbChange}
//           optionKey="code"
//           defaultValue={undefined}
//           t={t}
//         />
//         {/* </LabelFieldPair> */}
//         <div className="pt-search-action">
//           <SearchField className="pt-search-action-reset">
//             <p
//               onClick={() => {
//                 setSelectedUlb("");
//               }}
//             >
//               {t(`ES_COMMON_CLEAR_ALL`)}
//             </p>
//           </SearchField>
//           <SearchField className="pt-search-action-submit">
//             <SubmitBar label={t("ES_COMMON_SEARCH")} submit />
//           </SearchField>
//         </div>
//       </SearchForm>
//     </div>
//   );
// };

// export default HRMSEmployeewiseReport;

// import React, { useState, useEffect } from "react";
// import { Dropdown, Button, Table, SearchForm, Header, SearchField, SubmitBar } from "@mseva/digit-ui-react-components";
// import { useTranslation } from "react-i18next";
// import { useForm } from "react-hook-form";

// const HRMSEmployeewiseReport = () => {
//   const {
//     getValues,
//     register,
//     handleSubmit,
//     formState: { errors },
//     reset,
//     setValue,
//   } = useForm({
//     defaultValues: {
//       ulb: null,
//     },
//   });
//   const { isLoading: isLoadingReportsData, data: ReportsData } = Digit.Hooks.reports.useReportMeta.fetchReportData1(
//     "rainmaker-hrms",
//     "HRMSEmployeewiseReport",
//     "pb.punjab",
//     [
//       {
//         name: "ulb",
//         input: getValues().ulb ? getValues().ulb.code : "", //"pb.abohar",
//       },
//     ],
//     {
//       //enabled: !!filter.length > 0
//       enabled: true,
//     }
//   );

//   const { t } = useTranslation();
//   const tenantId = Digit.ULBService.getCurrentTenantId();
//   const { data: data = {}, isLoading } = Digit.Hooks.hrms.useHrmsMDMS(tenantId, "egov-hrms", "HRMSRolesandDesignation") || {};
//   //const [ulb, setUlb] = useState(null);
//   const [ulbOptions, setUlbOptions] = useState([]);
//   //   [
//   //   { i18text: "ulb1", active: true },
//   //   { i18text: "ulb2", active: true },
//   // ]
//   const [tableData, setTableData] = useState([]);
//   const [columns, setColumns] = useState([]);
//   // const tableData = [
//   //   { name: "1", mobilenumber: "2", tenantid: "3", role_assigned: "", user_id: "", departmentname: "", designationname: "", status: "" },
//   // ];
//   // const columns = [
//   //   // {
//   //   //   Header: t("ABG_BILL_NUMBER_LABEL"),
//   //   //   disableSortBy: true,
//   //   //   accessor: "billNumber",
//   //   //   Cell: ({ row }) => {
//   //   //     return getBillLink(row);
//   //   //   },
//   //   // },
//   //   // { Header: "S. No", accessor: (row, i) => i + 1 },
//   //   { Header: "Name", accessor: "name" },
//   //   { Header: "Mobile Number", accessor: "mobilenumber" },
//   //   { Header: "Tenant ID", accessor: "tenantid" },
//   //   { Header: "Role Assigned", accessor: "role_assigned" },
//   //   { Header: "User ID", accessor: "user_id" },
//   //   { Header: "Department Name", accessor: "departmentname" },
//   //   { Header: "Designation Name", accessor: "designationname" },
//   //   { Header: "Status", accessor: "status" },
//   // ];

//   useEffect(() => {
//     // Fetch ULB options on page load
//     // fetch("/api/ulb-options")
//     //   .then(response => response.json())
//     //   .then(data => setUlbOptions(data));
//   }, []);

//   const handleSearch = (values) => {
//     console.log("Searching hrms reports", values);
//     const columns = ReportsData.reportHeader.map((item) => {
//       return { ...item, Header: item.label, accessor: item.name };
//     });
//     const columnNames = columns.map((item) => item.name);
//     const rows = ReportsData.reportData.map((row) => {
//       const rowData = {};
//       columnNames.forEach((columnName, i) => {
//         rowData[columnName] = row[i];
//       });
//       return rowData;
//     });
//     setColumns(columns);
//     console.log(rows);
//     setTableData(rows);
//   };

//   const handleReset = () => {
//     console.log("resetting");
//     reset();
//     setTableData([]);
//   };

//   // const HandleUlbChange = (value) => {
//   //   setUlb(value);
//   // };

//   useEffect(() => {
//     fetchDropdownsData();
//   }, [data]);

//   const fetchDropdownsData = () => {
//     const ulbs = data?.MdmsRes?.tenant?.tenants
//       .filter((city) => city.code != Digit.ULBService.getStateId())
//       .map((city) => {
//         return { ...city, i18text: Digit.Utils.locale.getCityLocale(city.code) };
//       });
//     console.log("ulbs: ", data, ulbs);
//     setUlbOptions(ulbs);
//   };

//   console.log("Reports page api response:", ReportsData);
//   console.log("Get values: ", getValues());
//   console.log("ulb value: ", getValues().ulb);

//   return (
//     <div>
//       <Header>{t("HR_HRMS_EMPLOYEE_REPORT_HEADING")}</Header>
//       <SearchForm
//         // fields={[
//         //   {
//         //     label: "Select ULB",
//         //     type: "dropdown",
//         //     options: ulbOptions,
//         //     value: ulb,
//         //     //onChange: setUlb,
//         //   },
//         // ]}
//         onSubmit={handleSearch}
//         handleSubmit={handleSubmit}
//         // onReset={() => {
//         //   setSelectedUlb(null);
//         // }}
//       >
//         {/* <Dropdown
//           //label="ULB"
//           className="form-field"
//           selected={ulb}
//           option={ulbOptions}
//           select={HandleUlbChange}
//           optionKey="i18text"
//           defaultValue={undefined}
//           t={t}
//         /> */}
//         <SearchField>
//           <Dropdown
//             placeholder={t("ULB")}
//             option={ulbOptions}
//             selected={getValues().ulb}
//             select={(value) => setValue("ulb", value, { shouldValidate: true })}
//             optionKey="i18text"
//             t={t}
//             {...register("ulb", { required: "ULB is required" })}
//           />
//           {errors.ulb && <span>{errors.ulb.message}</span>}
//         </SearchField>
//         <div className="pt-search-action">
//           <SearchField className="pt-search-action-reset">
//             <p onClick={() => handleReset()}>{t(`ES_COMMON_CLEAR_ALL`)}</p>
//           </SearchField>
//           <SearchField className="pt-search-action-submit">
//             <SubmitBar label={t("ES_COMMON_SEARCH")} submit />
//           </SearchField>
//         </div>
//       </SearchForm>
//       <div style={{ overflowX: "auto" }}>
//         {tableData.length > 0 && (
//           <Table
//             t={t}
//             data={tableData}
//             columns={columns}
//             //totalRecords={count}
//             getCellProps={(cellInfo) => {
//               return {
//                 style: {
//                   // minWidth: cellInfo.column.Header === t("ABG_BILL_NUMBER_LABEL") ? "240px" : "",
//                   padding: "20px 18px",
//                   fontSize: "16px",
//                 },
//               };
//             }}
//             manualPagination={false}
//           />
//         )}
//       </div>
//     </div>
//   );
// };

// export default HRMSEmployeewiseReport;

// import React, { useState, useEffect } from "react";
// import { Dropdown, Button, Table, SearchForm, Header, SearchField, SubmitBar } from "@mseva/digit-ui-react-components";
// import { useTranslation } from "react-i18next";
// import { useForm } from "react-hook-form";

// const HRMSEmployeewiseReport = () => {
//   const {
//     getValues,
//     register,
//     handleSubmit,
//     formState: { errors },
//     reset,
//     setValue,
//   } = useForm({
//     defaultValues: {
//       ulb: null,
//     },
//   });

//   const { t } = useTranslation();
//   const tenantId = Digit.ULBService.getCurrentTenantId();
//   const { data: data = {}, isLoading } = Digit.Hooks.hrms.useHrmsMDMS(tenantId, "egov-hrms", "HRMSRolesandDesignation") || {};
//   const [ulbOptions, setUlbOptions] = useState([]);
//   const [tableData, setTableData] = useState([]);
//   const [columns, setColumns] = useState([]);
//   const [searchParams, setSearchParams] = useState(null);

//   useEffect(() => {
//     fetchDropdownsData();
//   }, [data]);

//   const fetchDropdownsData = () => {
//     const ulbs = data?.MdmsRes?.tenant?.tenants
//       .filter((city) => city.code != Digit.ULBService.getStateId())
//       .map((city) => {
//         return { ...city, i18text: Digit.Utils.locale.getCityLocale(city.code) };
//       });
//     setUlbOptions(ulbs);
//   };

//   const { data: ReportsData, isLoading: isLoadingReportsData } = Digit.Hooks.reports.useReportMeta.fetchReportData1(
//     "rainmaker-hrms",
//     "HRMSEmployeewiseReport",
//     "pb.punjab",
//     [
//       {
//         name: "ulb",
//         input: searchParams ? searchParams.ulb.code : "",
//       },
//     ],
//     {
//       enabled: !!searchParams,
//     }
//   );

//   useEffect(() => {
//     if (ReportsData) {
//       const columns = ReportsData.reportHeader.map((item) => {
//         return { ...item, Header: item.label, accessor: item.name };
//       });
//       const columnNames = columns.map((item) => item.name);
//       const rows = ReportsData.reportData.map((row) => {
//         const rowData = {};
//         columnNames.forEach((columnName, i) => {
//           rowData[columnName] = row[i];
//         });
//         return rowData;
//       });
//       setColumns(columns);
//       setTableData(rows);
//     }
//   }, [ReportsData]);

//   const handleSearch = (values) => {
//     setSearchParams(values);
//   };

//   const handleReset = () => {
//     reset();
//     setTableData([]);
//   };

//   return (
//     <div>
//       <Header>{t("HR_HRMS_EMPLOYEE_REPORT_HEADING")}</Header>
//       <SearchForm onSubmit={handleSearch} handleSubmit={handleSubmit}>
//         <SearchField>
//           <Dropdown
//             placeholder={t("ULB")}
//             option={ulbOptions}
//             selected={getValues().ulb}
//             select={(value) => setValue("ulb", value, { shouldValidate: true })}
//             optionKey="i18text"
//             t={t}
//             {...register("ulb", { required: "ULB is required" })}
//           />
//           {errors.ulb && <span>{errors.ulb.message}</span>}
//         </SearchField>
//         <div className="pt-search-action">
//           <SearchField className="pt-search-action-reset">
//             <p onClick={() => handleReset()}>{t(`ES_COMMON_CLEAR_ALL`)}</p>
//           </SearchField>
//           <SearchField className="pt-search-action-submit">
//             <SubmitBar label={t("ES_COMMON_SEARCH")} submit />
//           </SearchField>
//         </div>
//       </SearchForm>
//       <div style={{ overflowX: "auto" }}>
//         {tableData.length > 0 && (
//           <Table
//             t={t}
//             data={tableData}
//             columns={columns}
//             getCellProps={(cellInfo) => {
//               return {
//                 style: {
//                   padding: "20px 18px",
//                   fontSize: "16px",
//                 },
//               };
//             }}
//             manualPagination={false}
//           />
//         )}
//       </div>
//     </div>
//   );
// };

// export default HRMSEmployeewiseReport;

import React, { useState, useEffect } from "react";
import { Dropdown, Button, Table, SearchForm, Header, SearchField, SubmitBar, Loader } from "@mseva/digit-ui-react-components";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";

const HRMSEmployeewiseReport = () => {
  const {
    getValues,
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    defaultValues: {
      ulb: null,
    },
  });

  const { t } = useTranslation();
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const { data: data = {}, isLoading } = Digit.Hooks.hrms.useHrmsMDMS(tenantId, "egov-hrms", "HRMSRolesandDesignation") || {};
  const [ulbOptions, setUlbOptions] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [searchParams, setSearchParams] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDropdownsData();
  }, [data]);

  const fetchDropdownsData = () => {
    const ulbs = data?.MdmsRes?.tenant?.tenants
      .filter((city) => city.code != Digit.ULBService.getStateId())
      .map((city) => {
        return { ...city, i18text: Digit.Utils.locale.getCityLocale(city.code) };
      });
    setUlbOptions(ulbs);
  };

  const { data: ReportsData, isLoading: isLoadingReportsData } = Digit.Hooks.reports.useReportMeta.fetchReportData1(
    "rainmaker-hrms",
    "HRMSEmployeewiseReport",
    "pb.punjab",
    [
      {
        name: "ulb",
        input: searchParams ? searchParams.ulb.code : "",
      },
    ],
    {
      enabled: !!searchParams,
    }
  );

  useEffect(() => {
    if (ReportsData) {
      const columns = ReportsData.reportHeader.map((item) => {
        return { ...item, Header: item.label, accessor: item.name };
      });
      const columnNames = columns.map((item) => item.name);
      const rows = ReportsData.reportData.map((row) => {
        const rowData = {};
        columnNames.forEach((columnName, i) => {
          rowData[columnName] = row[i];
        });
        return rowData;
      });
      setColumns(columns);
      setTableData(rows);
      setLoading(false);
    }
  }, [ReportsData]);

  const handleSearch = (values) => {
    setLoading(true);
    setSearchParams(values);
  };

  const handleReset = () => {
    reset();
    setTableData([]);
  };

  return (
    <div>
      <Header>{t("HR_HRMS_EMPLOYEE_REPORT_HEADING")}</Header>
      <SearchForm onSubmit={handleSearch} handleSubmit={handleSubmit}>
        <SearchField>
          <Dropdown
            placeholder={t("ULB")}
            option={ulbOptions}
            selected={getValues().ulb}
            select={(value) => setValue("ulb", value, { shouldValidate: true })}
            optionKey="i18text"
            t={t}
            {...register("ulb", { required: "ULB is required" })}
          />
          {errors.ulb && <span>{errors.ulb.message}</span>}
        </SearchField>
        <div className="pt-search-action">
          <SearchField className="pt-search-action-reset">
            <p onClick={() => handleReset()}>{t(`ES_COMMON_CLEAR_ALL`)}</p>
          </SearchField>
          <SearchField className="pt-search-action-submit">
            <SubmitBar label={t("ES_COMMON_SEARCH")} submit />
          </SearchField>
        </div>
      </SearchForm>
      {loading ? (
        <Loader />
      ) : (
        <div style={{ overflowX: "auto" }}>
          {tableData.length > 0 && (
            <Table
              t={t}
              data={tableData}
              columns={columns}
              getCellProps={(cellInfo) => {
                return {
                  style: {
                    padding: "20px 18px",
                    fontSize: "16px",
                  },
                };
              }}
              manualPagination={false}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default HRMSEmployeewiseReport;
