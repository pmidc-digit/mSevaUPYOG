const fs = require('fs');

const fixes = [
  {
    file: "micro-ui-internals/packages/libraries/src/services/elements/PT.js",
    replaces: [
      { line: 153, search: 'auth: true,', replace: '// auth: true,' },
      { line: 163, search: 'auth: true,', replace: '// auth: true,' },
    ]
  },
  {
    file: "micro-ui-internals/packages/libraries/src/utils/index.js",
    replaces: [
      { line: 307, search: 'downloadBill,', replace: '// downloadBill,' },
    ]
  },
  {
    file: "micro-ui-internals/packages/libraries/src/services/elements/OBPS.js",
    replaces: [
      { line: 528, search: 'isTransLate: true,', replace: '// isTransLate: true,' }
    ]
  },
  {
    file: "micro-ui-internals/packages/libraries/src/services/elements/WorkFlow.js",
    replaces: [
      { line: 145, search: 'roles: state?.action, roles:', replace: 'roles:' }
    ]
  },
  {
    file: "micro-ui-internals/packages/libraries/src/hooks/index.js",
    replaces: [
      { line: 515, search: 'useVendorCreate,', replace: '// useVendorCreate,' },
      { line: 516, search: 'useVendorUpdate,', replace: '// useVendorUpdate,' },
      { line: 517, search: 'useVehicleDetails,', replace: '// useVehicleDetails,' },
      { line: 518, search: 'useVehicleCreate,', replace: '// useVehicleCreate,' },
      { line: 653, search: 'useLayoutBuildingType,', replace: '// useLayoutBuildingType,' },
      { line: 654, search: 'useLayoutBuildingCategory,', replace: '// useLayoutBuildingCategory,' },
      { line: 655, search: 'useLayoutRoadType,', replace: '// useLayoutRoadType,' },
      { line: 666, search: 'useLayoutBuildingCategory,', replace: '// useLayoutBuildingCategory,' },
      { line: 692, search: 'useSvSearchApplication,', replace: '// useSvSearchApplication,' }
    ]
  },
  {
    file: "micro-ui-internals/packages/libraries/src/services/elements/MDMS.js",
    replaces: [
      { line: 1867, search: 'case "Documents":', replace: '// case "Documents":' },
      { line: 1868, search: 'return getPetDocumentsRequiredScreen(MdmsRes);', replace: '// return getPetDocumentsRequiredScreen(MdmsRes);' },
      { line: 1876, search: 'case "Documents":', replace: '// case "Documents":' },
      { line: 1877, search: 'return getSVDocuments(MdmsRes);', replace: '// return getSVDocuments(MdmsRes);' },
      { line: 1879, search: 'case "Documents":', replace: '// case "Documents":' },
      { line: 1880, search: 'return getADSDocuments(MdmsRes);', replace: '// return getADSDocuments(MdmsRes);' },
      { line: 1903, search: 'case "Documents":', replace: '// case "Documents":' },
      { line: 1904, search: 'return getAssetDocuments(MdmsRes);', replace: '// return getAssetDocuments(MdmsRes);' }
    ]
  },
  {
    file: "micro-ui-internals/packages/libraries/src/hooks/swach/useComplaintDetails.js",
    replaces: [
      { line: 52, search: 'service: service,', replace: '// service: service,' }
    ]
  },
  {
    file: "micro-ui-internals/packages/libraries/src/hooks/pgr/useComplaintDetails.js",
    replaces: [
      { line: 52, search: 'service: service,', replace: '// service: service,' }
    ]
  },
  {
    file: "micro-ui-internals/packages/libraries/src/hooks/billAmendment/useInbox.js",
    replaces: [
      { line: 63, search: 'status: application?.businessObject?.status,', replace: '// status: application?.businessObject?.status,' }
    ]
  },
  {
    file: "micro-ui-internals/packages/libraries/src/hooks/pgrAi/useApplicationDetails.js",
    replaces: [
      { line: 82, search: 'service: service,', replace: '// service: service,' }
    ]
  },
  {
    file: "micro-ui-internals/packages/libraries/src/hooks/obps/useEDCRForm.js",
    replaces: [
      { line: 277, search: 'setcoreArea,', replace: '// setcoreArea,' }
    ]
  },
  {
    file: "micro-ui-internals/packages/modules/bills/src/components/citizen/SearchCitizen.js",
    replaces: [
      { line: 184, search: 'width: "100%", textAlign: "right", width: "240px", textAlign: "right",', replace: 'width: "240px", textAlign: "right",' }
    ]
  },
  {
    file: "micro-ui-internals/packages/modules/Firenoc/src/pageComponents/FireNOCApplicantDetails.js",
    replaces: [
      { line: 678, search: 'background: "linear-gradient(135deg, #2563eb, #1e40af)",', replace: '// background: "linear-gradient(135deg, #2563eb, #1e40af)",' }
    ]
  },
  {
    file: "micro-ui-internals/packages/modules/dss/src/components/DSSCard.js",
    replaces: [
      { line: 40, search: 'link: obj?.others?`/digit-ui/employee/dss/${obj?.key}`:`/digit-ui/employee/dss/dashboard/${obj?.key}`,', replace: '// link: obj?.others?`/digit-ui/employee/dss/${obj?.key}`:`/digit-ui/employee/dss/dashboard/${obj?.key}`,' }
    ]
  },
  {
    file: "micro-ui-internals/packages/modules/dss/src/pages/About.js",
    replaces: [
      { line: 23, search: 'marginBottom: "0", fontSize: "24px" , marginBottom:"10px"', replace: 'fontSize: "24px", marginBottom: "10px"' }
    ]
  },
  {
    file: "micro-ui-internals/packages/modules/ws/src/pageComponents/WSPlumberDetails.js",
    replaces: [
      { line: 128, search: 'setPlumberDetails', replace: '// setPlumberDetails' }
    ]
  },
  {
    file: "micro-ui-internals/packages/modules/ws/src/pageComponents/WSConnectionDetails.js",
    replaces: [
      { line: 168, search: 'formData,', replace: '// formData,' }
    ]
  },
  {
    file: "micro-ui-internals/packages/modules/ws/src/pageComponents/WSConnectionHolderDetails.js",
    replaces: [
      { line: 144, search: 'connectionHolderDetails,', replace: '// connectionHolderDetails,' }
    ]
  },
  {
    file: "micro-ui-internals/packages/modules/ws/src/pageComponents/WSActivationPlumberDetails.js",
    replaces: [
      { line: 54, search: 'setPlumberDetails', replace: '// setPlumberDetails' }
    ]
  },
  {
    file: "micro-ui-internals/packages/modules/ws/src/pages/citizen/WSApplicationDetails.js",
    replaces: [
      { line: 212, search: 'case "PENDING_FOR_PAYMENT":', replace: '// case "PENDING_FOR_PAYMENT":' }
    ]
  },
  {
    file: "micro-ui-internals/packages/modules/obps/src/pageComponents/OCeDCRScrutiny.js",
    replaces: [
      { line: 201, search: 'fontWeight: "bold", fontSize: "14px", lineHeight: "19px", color: "#505A5F", fontWeight: "400"', replace: 'fontSize: "14px", lineHeight: "19px", color: "#505A5F", fontWeight: "400"' },
      { line: 207, search: 'fontWeight: "bold", fontSize: "14px", lineHeight: "19px", color: "#505A5F", fontWeight: "400"', replace: 'fontSize: "14px", lineHeight: "19px", color: "#505A5F", fontWeight: "400"' }
    ]
  },
  {
    file: "micro-ui-internals/packages/modules/obps/src/pages/citizen/BpaApplicationDetail/index.js",
    replaces: [
      { line: 1573, search: 'data: {', replace: '/* data: { */' },
      { line: 1574, search: '...workflowDetails?.data,', replace: '/* ...workflowDetails?.data, */' },
      { line: 1575, search: 'nextActions: [],', replace: '/* nextActions: [], */' },
      { line: 1576, search: '},', replace: '/* }, */' },
    ]
  },
  {
    file: "micro-ui-internals/packages/modules/obps/src/pages/citizen/LayoutStepper/LayoutStepperForm.js",
    replaces: [
      { line: 169, search: 'authorisedPerson: primaryOwner?.additionalDetails?.authorisedPerson || ""', replace: '// authorisedPerson: primaryOwner?.additionalDetails?.authorisedPerson || ""' }
    ]
  },
  {
    file: "micro-ui-internals/packages/modules/obps/src/pages/citizen/LayoutStepper/LayoutStepFormTwo.js",
    replaces: [
      { line: 98, search: 'floorArea: currentStepData?.siteDetails?.floorArea || [{ value: "" }],', replace: '// floorArea: currentStepData?.siteDetails?.floorArea || [{ value: "" }],' }
    ]
  },
  {
    file: "micro-ui-internals/packages/modules/obps/src/pages/citizen/Applications/LayoutApplicationSummary.js",
    replaces: [
      { line: 302, search: 'label: t("CLU_FEE_RECEIPT_2"),', replace: '// label: t("CLU_FEE_RECEIPT_2"),' }
    ]
  },
  {
    file: "micro-ui-internals/packages/modules/pt/src/pages/employee/NewApplication/index.js",
    replaces: [
      { line: 135, search: 'additionalDetails:{', replace: '/* additionalDetails:{ */' },
      { line: 136, search: 'vasikaNo: data?.vasikaDetails?.vasikaNo,', replace: '/* vasikaNo: data?.vasikaDetails?.vasikaNo, */' },
      { line: 137, search: 'vasikaDate: data?.vasikaDetails?.vasikaDate,', replace: '/* vasikaDate: data?.vasikaDetails?.vasikaDate, */' },
      { line: 138, search: 'allotmentNumber: data?.vasikaDetails?.allotmentNumber,', replace: '/* allotmentNumber: data?.vasikaDetails?.allotmentNumber, */' },
      { line: 139, search: 'bndNumber: data?.vasikaDetails?.bndNumber,', replace: '/* bndNumber: data?.vasikaDetails?.bndNumber, */' },
      { line: 140, search: 'businessService: data?.vasikaDetails?.businessService,', replace: '/* businessService: data?.vasikaDetails?.businessService, */' },
      { line: 141, search: '},', replace: '/* }, */' },
      { line: 453, search: '"key": "vasikaDetails",', replace: '// "key": "vasikaDetails",' }
    ]
  },
  {
    file: "micro-ui-internals/packages/modules/pt/src/pages/citizen/Create/NewApplication.js",
    replaces: [
      { line: 135, search: 'additionalDetails:{', replace: '/* additionalDetails:{ */' },
      { line: 136, search: 'vasikaNo: data?.vasikaDetails?.vasikaNo,', replace: '/* vasikaNo: data?.vasikaDetails?.vasikaNo, */' },
      { line: 137, search: 'vasikaDate: data?.vasikaDetails?.vasikaDate,', replace: '/* vasikaDate: data?.vasikaDetails?.vasikaDate, */' },
      { line: 138, search: 'allotmentNumber: data?.vasikaDetails?.allotmentNumber,', replace: '/* allotmentNumber: data?.vasikaDetails?.allotmentNumber, */' },
      { line: 139, search: 'bndNumber: data?.vasikaDetails?.bndNumber,', replace: '/* bndNumber: data?.vasikaDetails?.bndNumber, */' },
      { line: 140, search: 'businessService: data?.vasikaDetails?.businessService,', replace: '/* businessService: data?.vasikaDetails?.businessService, */' },
      { line: 141, search: '},', replace: '/* }, */' },
      { line: 453, search: '"key": "vasikaDetails",', replace: '// "key": "vasikaDetails",' }
    ]
  },
  {
    file: "micro-ui-internals/packages/modules/engagement/src/pages/employee/Events/Inbox/index.js",
    replaces: [
      { line: 131, search: 'links={links}', replace: '{/* links={links} */}' }
    ]
  },
  {
    file: "micro-ui-internals/packages/modules/engagement/src/pages/employee/Documents/Inbox/index.js",
    replaces: [
      { line: 114, search: 'links={links}', replace: '{/* links={links} */}' }
    ]
  },
  {
    file: "micro-ui-internals/packages/modules/engagement/src/components/Surveys/FillQuestions.js",
    replaces: [
      { line: 389, search: 'tenantId:', replace: '/* tenantId:' },
      { line: 390, search: 'city === null', replace: 'city === null' },
      { line: 391, search: '? window.location.href?.includes("/employee")', replace: '? window.location.href?.includes("/employee")' },
      { line: 392, search: '? Digit.ULBService.getCurrentTenantId()', replace: '? Digit.ULBService.getCurrentTenantId()' },
      { line: 393, search: ': Digit.ULBService.getStateId()', replace: ': Digit.ULBService.getStateId()' },
      { line: 394, search: ': city,', replace: ': city, */' },
    ]
  },
  {
    file: "micro-ui-internals/packages/modules/sv/src/pageComponents/SVAdrressDetails.js",
    replaces: [
      { line: 368, search: 'businessService: "street-vending",', replace: '// businessService: "street-vending",' },
      { line: 369, search: 'moduleName: "sv-services",', replace: '// moduleName: "sv-services",' }
    ]
  },
  {
    file: "micro-ui-internals/packages/modules/sv/src/pageComponents/SVDocumentsDetail.js",
    replaces: [
      { line: 237, search: 'businessService: "street-vending",', replace: '// businessService: "street-vending",' },
      { line: 238, search: 'moduleName: "sv-services",', replace: '// moduleName: "sv-services",' }
    ]
  },
  {
    file: "micro-ui-internals/packages/modules/sv/src/pageComponents/SVApplicantDetails.js",
    replaces: [
      { line: 496, search: 'businessService: "street-vending",', replace: '// businessService: "street-vending",' },
      { line: 497, search: 'moduleName: "sv-services",', replace: '// moduleName: "sv-services",' }
    ]
  },
  {
    file: "micro-ui-internals/packages/modules/sv/src/pageComponents/SVBusinessDetails.js",
    replaces: [
      { line: 478, search: 'businessService: "street-vending",', replace: '// businessService: "street-vending",' },
      { line: 479, search: 'moduleName: "sv-services",', replace: '// moduleName: "sv-services",' }
    ]
  },
  {
    file: "micro-ui-internals/packages/modules/sv/src/pageComponents/SVBankDetails.js",
    replaces: [
      { line: 305, search: 'businessService: "street-vending",', replace: '// businessService: "street-vending",' },
      { line: 306, search: 'moduleName: "sv-services",', replace: '// moduleName: "sv-services",' }
    ]
  },
  {
    file: "micro-ui-internals/packages/modules/sv/src/pageComponents/SVSpecialCategory.js",
    replaces: [
      { line: 306, search: 'businessService: "street-vending",', replace: '// businessService: "street-vending",' },
      { line: 307, search: 'moduleName: "sv-services",', replace: '// moduleName: "sv-services",' }
    ]
  },
  {
    file: "micro-ui-internals/packages/modules/asset/src/pageComponents/EditGeneralDetails.js",
    replaces: [
      { line: 19, search: 'assetclassification: "",', replace: '// assetclassification: "",' }
    ]
  },
  {
    file: "micro-ui-internals/packages/libraries/src/utils/pdf.js",
    replaces: [
      { line: 1513, search: 'width: 70,', replace: '// width: 70,' },
      { line: 2343, search: 'width: 70,', replace: '// width: 70,' }
    ]
  },
  {
    file: "micro-ui-internals/packages/react-components/src/atoms/UploadFile.js",
    replaces: [
      { line: 20, search: 'width: "80%"', replace: '// width: "80%"' },
      { line: 91, search: 'margin: "5px"', replace: '// margin: "5px"' }
    ]
  },
  {
    file: "micro-ui-internals/packages/modules/pgr/src/components/DesktopInbox.js",
    replaces: [
      { line: 154, search: 'marginTop: "24px", marginTop: "24px",', replace: 'marginTop: "24px",' }
    ]
  },
  {
    file: "micro-ui-internals/packages/modules/receipts/src/components/inbox/ReceiptsDesktopInbox.js",
    replaces: [
      { line: 113, search: 'onPageSizeChange={props.onPageSizeChange}', replace: '{/* onPageSizeChange={props.onPageSizeChange} */}' }
    ]
  },
  {
    file: "micro-ui-internals/packages/modules/noc/src/pageComponents/NOCCustomUploadFile.js",
    replaces: [
      { line: 19, search: 'width: "80%",', replace: '// width: "80%",' },
      { line: 91, search: 'margin: "5px",', replace: '// margin: "5px",' }
    ]
  },
  {
    file: "micro-ui-internals/packages/modules/templates/ApplicationDetails/components/DocumentsPreview.js",
    replaces: [
      { line: 19, search: 'minWidth: "80px", marginRight: "10px", maxWidth: "100px", height: "auto", minWidth: "100px"', replace: 'marginRight: "10px", maxWidth: "100px", height: "auto", minWidth: "100px"' },
      { line: 31, search: 'minWidth: "80px", marginRight: "10px", maxWidth: "100px", height: "auto", minWidth: "100px"', replace: 'marginRight: "10px", maxWidth: "100px", height: "auto", minWidth: "100px"' },
      { line: 55, search: 'color: "#505A5F", fontWeight: "400", textAlign: "center", color: "#505A5F"', replace: 'fontWeight: "400", textAlign: "center", color: "#505A5F"' }
    ]
  },
  {
    file: "micro-ui-internals/packages/modules/fsm/src/config/NewApplication/config.js",
    replaces: [
      { line: 157, search: 'component: "CheckSlum",', replace: '// component: "CheckSlum",' }
    ]
  },
  {
    file: "micro-ui-internals/packages/modules/fsm/src/pages/citizen/NewApplication/Response.js",
    replaces: [
      { line: 105, search: 'additionalDetails: {', replace: '/* additionalDetails: {' },
      { line: 106, search: 'totalAmount: amount,', replace: 'totalAmount: amount,' },
      { line: 107, search: 'tripAmount: amountPerTrip,', replace: 'tripAmount: amountPerTrip,' },
      { line: 108, search: '},', replace: '}, */' },
    ]
  },
  {
    file: "micro-ui-internals/packages/modules/Firenoc/src/pageComponents/NOCCustomUploadFile.js",
    replaces: [
      { line: 19, search: 'width: "80%",', replace: '// width: "80%",' },
      { line: 91, search: 'margin: "5px",', replace: '// margin: "5px",' }
    ]
  },
  {
    file: "micro-ui-internals/packages/modules/dss/src/components/common/Icon.js",
    replaces: [
      { line: 28, search: "case 'obps dashboard':", replace: "// case 'obps dashboard':" }
    ]
  },
  {
    file: "micro-ui-internals/packages/modules/obps/src/components/CustomUploadFile.js",
    replaces: [
      { line: 27, search: 'width: "80%",', replace: '// width: "80%",' },
      { line: 98, search: 'margin: "5px",', replace: '// margin: "5px",' }
    ]
  }
];

fixes.forEach(({ file, replaces }) => {
  if (!fs.existsSync(file)) {
    console.log("File not found: " + file);
    return;
  }
  let lines = fs.readFileSync(file, 'utf8').split('\n');
  let changed = false;
  replaces.forEach(({ line, search, replace }) => {
    // line is 1-based index
    const index = line - 1;
    if (lines[index]) {
      if (lines[index].includes(search)) {
        lines[index] = lines[index].replace(search, replace);
        changed = true;
      } else {
        console.log(`Warning: "${search}" not found on line ${line} in ${file}.`);
      }
    }
  });
  if (changed) {
    fs.writeFileSync(file, lines.join('\n'));
    console.log("Updated " + file);
  }
});
