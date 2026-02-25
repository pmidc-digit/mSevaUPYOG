

import React, { use, useEffect, useState, useMemo } from "react";
import {
  CardLabel,
  Dropdown,
  UploadFile,
  Toast,
  Loader,
  FormStep,
  LabelFieldPair,
  MultiUploadWrapper,
  CitizenInfoLabel,
  ViewsIcon,
} from "@mseva/digit-ui-react-components";
import EXIF from "exif-js";
import { useDispatch, useSelector } from "react-redux";
import { pdfDownloadLink } from "../utils";
import { UPDATE_LayoutNewApplication_CoOrdinates } from "../redux/actions/LayoutNewApplicationActions";
import { useParams } from "react-router-dom";
import CustomUploadFile from "../components/CustomUploadFile";



const LayoutDocumentsRequired = ({
  t,
  config,
  onSelect,
  userType,
  formData,
  setError: setFormError,
  clearErrors: clearFormErrors,
  formState,
}) => {
  const tenantId = Digit.ULBService.getStateId()
  const [documents, setDocuments] = useState(formData?.documents?.documents)
  // console.log("documents in childStep three", documents, formData)
  const [error, setError] = useState(null)
  const [enableSubmit, setEnableSubmit] = useState(true)
  const [checkRequiredFields, setCheckRequiredFields] = useState(false)
  const [geocoordinates, setGeoCoordinates] = useState(null)

  const { id } = useParams()
  const isEditApplication = Boolean(id)

  const stateId = Digit.ULBService.getStateId()
  const dispatch = useDispatch()

  // Module: LAYOUT, Master: LayoutDocuments
  const { isLoading, data } = Digit.Hooks.pt.usePropertyMDMS(stateId, "LAYOUT", ["LayoutDocuments"])

  const coordinates = useSelector((state) => state?.obps?.LayoutNewApplicationFormReducer?.coordinates || {})

  useEffect(() => {
    if (Object.keys(coordinates).length > 0) {
      setGeoCoordinates(coordinates)
    }
  }, [coordinates])

  // console.log("coordinates (from redux)", coordinates, data)
  console.log("geocoordinates", geocoordinates)

  const currentStepData = useSelector((state) => state?.obps?.LayoutNewApplicationFormReducer?.formData) || {}
  // const applicationNo = currentStepData?.apiData?.Layout?.applicationNo || ""
  // const isVacant = currentStepData?.siteDetails?.buildingStatus?.code === "VACANT" || false
  
  // // Get CLU approval status from siteDetails - Check multiple possible locations
  // const cluApprovedValue = currentStepData?.siteDetails?.isCluRequired?.code || currentStepData?.siteDetails?.isCluRequired
  // const isCluApproved = cluApprovedValue === "YES" || cluApprovedValue === true || false
  
  // const isRestrictedArea = currentStepData?.siteDetails?.specificationRestrictedArea?.code === "YES" || false
  // const isUnderMasterPlan = currentStepData?.siteDetails?.specificationIsSiteUnderMasterPlan?.code === "YES" || false

  // // Get road type to check if National Highway
  // const roadType = currentStepData?.siteDetails?.roadType?.name || currentStepData?.siteDetails?.roadType || ""
  // const isNationalHighway = roadType?.toLowerCase().includes("national") || roadType?.toLowerCase().includes("nh")

  // // Get building category to check if Institution
  // const buildingCategory = currentStepData?.siteDetails?.buildingCategory?.code || currentStepData?.siteDetails?.buildingCategory || ""
  // const isInstitution = buildingCategory?.toLowerCase().includes("institution") || buildingCategory === "INSTITUTION"

  const [applicationNo, setApplicationNo] = useState("");
  const [isVacant, setIsVacant] = useState(false);
  const [isCluApproved, setIsCluApproved] = useState(false);
  const [isRestrictedArea, setIsRestrictedArea] = useState(false);
  const [isUnderMasterPlan, setIsUnderMasterPlan] = useState(false);
  const [isNationalHighway, setIsNationalHighway] = useState(false);
  const [isInstitution, setIsInstitution] = useState(false);

  useEffect(() => {
    if (!currentStepData) return;

    // Application No
    setApplicationNo(
      currentStepData?.apiData?.Layout?.applicationNo || ""
    );

    // Vacant
    setIsVacant(
      currentStepData?.siteDetails?.buildingStatus?.code === "VACANT"
    );

    // CLU Approved
    const cluApprovedValue =
      currentStepData?.siteDetails?.isCluRequired?.code ||
      currentStepData?.siteDetails?.isCluRequired;

    setIsCluApproved(
      cluApprovedValue === "YES" || cluApprovedValue === true
    );

    // Restricted Area
    setIsRestrictedArea(
      currentStepData?.siteDetails?.specificationRestrictedArea?.code === "YES"
    );

    // Under Master Plan
    setIsUnderMasterPlan(
      currentStepData?.siteDetails?.specificationIsSiteUnderMasterPlan?.code === "YES"
    );

    // National Highway
    const roadType =
      currentStepData?.siteDetails?.roadType?.name ||
      currentStepData?.siteDetails?.roadType ||
      "";

    setIsNationalHighway(
      roadType.toLowerCase().includes("national") ||
      roadType.toLowerCase().includes("nh")
    );

    // Institution
    const buildingCategory =
      currentStepData?.siteDetails?.buildingCategory?.code ||
      currentStepData?.siteDetails?.buildingCategory ||
      "";

    setIsInstitution(
      buildingCategory === "INSTITUTION" ||
      buildingCategory.toLowerCase().includes("institution")
    );

  }, [currentStepData]);



  // console.log("🔍 CLU Status Check:")
  // console.log("  cluIsApproved value:", currentStepData?.siteDetails?.cluIsApproved, currentStepData, documents)
  // // console.log("  Extracted cluApprovedValue:", cluApprovedValue)
  // console.log("  isCluApproved boolean:", isCluApproved)
  // console.log("Restricted Area:", isRestrictedArea, currentStepData?.siteDetails?.specificationRestrictedArea)
  // console.log("Under Master Plan:", isUnderMasterPlan, currentStepData?.siteDetails?.specificationIsSiteUnderMasterPlan)


  // NOTE: Document requirements are now determined by backend config:
  // - If cluRequired: true → document mandatory only when CLU = YES
  // - If required: true → document always mandatory (unless overridden by condition)
  // - Hardcoded arrays below kept for reference only (using backend config instead)

  const cluYesMandatoryDocs = [
    "OWNER.REVENUEPLANAKSHSHAJRA",           // Revenue Plan / Aksh Shajra
    "OWNER.SITEMARKEDONLATHAPARTPLAN",      // Site marked on Latha Part Plan
    "OWNER.SITEMARKEDONMASTERPLAN",         // Site marked on Master Plan
    "OWNER.SITEMARKEDONSATELLITEPLAN",      // Site marked on Satellite Plan
    "OWNER.MUSTARKALANDAFFIDAVIT",          // Mustarka Land (Kabja) Affidavit
  ]

  const cluNoMandatoryDocs = [
    "OWNER.LAYOUTDRAWINGWITHSUPERIMPOSEDKHASRNO",  // Layout Drawing with Superimposed Khasra no.
    "OWNER.CIRCLEREVENUEOFFICERREPORT",             // Circle Revenue Officer report
    "OWNER.NONENCUMBRANCECERTIFICATEFROMTEHSILDAR", // NON-Encumbrance certificate from Tehsildar
    "OWNER.REVENUEPLAN",                            // Revenue Plan
    "OWNER.SITEMARKEDONPLAN",                       // Site marked on Google Plan in Case of non-scheme Areas and Part Layout in case of Scheme Areas
  ]

  // Filter documents based on building status, CLU approval, road type, and category
  const filteredDocuments = useMemo(() => {
    // console.log("🔄 useMemo CALLED - isCluApproved:", isCluApproved, "isNationalHighway:", isNationalHighway, "isInstitution:", isInstitution)
    let docs = data?.LAYOUT?.LayoutDocuments || []
    
    // console.log("=== FILTER DEBUG ===")
    // console.log("Initial docs count:", docs.length, docs)
    // console.log("isCluApproved:", isCluApproved)
    // console.log("isNationalHighway:", isNationalHighway)
    // console.log("isInstitution:", isInstitution)
    
    // Filter and process documents
    const processedDocs = docs
      .map((doc) => {
        // Set default required status based on backend config
        let isRequired = doc.required || false
        
        // Override required status based on conditions
        
        // Site photographs are ALWAYS mandatory (regardless of CLU)
        if (doc.code === "OWNER.SITEPHOTOGRAPHONE" || doc.code === "OWNER.SITEPHOTOGRAPHTWO") {
          isRequired = true
        }
        // National Highway NOC is mandatory only when it's a National Highway
        else if (doc.code === "OWNER.NATIONALHIGHWAYNOC") {
          isRequired = isNationalHighway
        }
        // When CLU = YES: Make specific CLU documents mandatory
        // else if (isCluApproved && doc.cluRequired) {
        //   isRequired = true
        // }
        // When CLU = NO: CLU-required docs become NOT mandatory, but regular required docs stay mandatory
        // else if (!isCluApproved && doc.cluRequired) {
        //   isRequired = false
        // }
        
        // Filter out building drawing if vacant
        if (isVacant && doc.code === "OWNER.BUILDINGDRAWING") {
          return null
        }
        
        return { ...doc, required: isRequired }
      }).filter(doc => !(doc?.cluRequired && !isCluApproved))
      .filter(doc => doc !== null)
    
    // console.log("Final docs count:", processedDocs.length)
    // console.log("Mandatory docs:", processedDocs.filter(d => d.required).map(d => ({ code: d.code, required: d.required, cluRequired: d.cluRequired })))
    // console.log("=== END DEBUG ===")
    
    return processedDocs
  }, [isVacant, isCluApproved, isNationalHighway, isInstitution, data?.LAYOUT?.LayoutDocuments?.length])

  // console.log("filteredDocs and documents", filteredDocuments, documents)

  const handleSubmit = () => {
    const document = formData.documents
    let documentStep
    documentStep = { ...document, documents: documents }
    // console.log("filteredDocs and documents", filteredDocuments, documents)
    onSelect(config.key, documentStep)
  }

  const onSkip = () => onSelect()
  function onAdd() {}

  useEffect(() => {
    let count = 0
    filteredDocuments?.map((doc) => {
      doc.hasDropdown = true

      let isRequired = false
      ;(documents || []).map((data) => {
        if (doc.required && data?.documentType.includes(doc.code)) isRequired = true
      })
      if (!isRequired && doc.required) count = count + 1
    })
    if ((count == "0" || count == 0) && documents?.length > 0) setEnableSubmit(false)
    else setEnableSubmit(true)
  }, [documents, checkRequiredFields, filteredDocuments])

  useEffect(() => {
    const currentStatus = currentStepData?.siteDetails?.buildingStatus?.code

    if (currentStatus === "VACANT") {
      setDocuments((prevDocs) => (prevDocs || []).filter((doc) => doc.documentType !== "OWNER.BUILDINGDRAWING"))
    }
  }, [currentStepData?.siteDetails?.buildingStatus?.code])

  const documentObj = {
    value: {
      workflowDocs: (documents || []).map((doc) => ({
        documentType: doc.documentType,
        filestoreId: doc.filestoreId,
        documentUid: doc.documentUid,
        documentAttachment: doc.documentAttachment || doc.filestoreId,
      })),
    },
  }

  const { isLoading: isDocLoading, data: docPreviewData } = Digit.Hooks.obps.useLayoutDocumentSearch(documentObj)

  const documentLinks = (documents || []).map((doc) => ({
    code: doc.documentType,
    link: pdfDownloadLink(docPreviewData?.pdfFiles, doc.filestoreId || doc.documentAttachment),
  }))

  return (
    <div>
      {!isEditApplication && applicationNo ? (
        <CitizenInfoLabel
          info={t("CS_FILE_APPLICATION_INFO_LABEL")}
          text={`${t("BPA_APPLICATION_NUMBER_LABEL")} ${applicationNo} ${t("BPA_DOCS_INFORMATION")}`}
          className={"info-banner-wrap-citizen-override"}
        />
      ) : null}

      {!isLoading ? (
        <FormStep t={t} config={config} onSelect={handleSubmit} onSkip={onSkip} isDisabled={enableSubmit} onAdd={onAdd}>
          {filteredDocuments?.map((document, index) => {
            return (
              <LayoutSelectDocument
                key={index}
                document={document}
                t={t}
                error={error}
                setError={setError}
                setDocuments={setDocuments}
                documents={documents}
                setCheckRequiredFields={setCheckRequiredFields}
                handleSubmit={handleSubmit}
                geocoordinates={geocoordinates}
                setGeoCoordinates={setGeoCoordinates}
                dispatch={dispatch}
                previewLink={documentLinks?.find((link) => link.code === document.code)?.link}
              />
            )
          })}
          {error && <Toast label={error} isDleteBtn={true} onClose={() => setError(null)} error />}
        </FormStep>
      ) : (
        <Loader />
      )}
    </div>
  )
}

function LayoutSelectDocument({
  t,
  document: doc,
  setDocuments,
  setError,
  documents,
  action,
  formData,
  handleSubmit,
  id,
  geocoordinates,
  setGeoCoordinates,
  dispatch,
  previewLink,
}) {
  const filteredDocument = (documents || []).filter((item) => item?.documentType?.includes(doc?.code))[0]

  const tenantId = Digit.ULBService.getCurrentTenantId()
  const [selectedDocument, setSelectedDocument] = useState(
    filteredDocument
      ? { ...filteredDocument, active: doc?.active === true, code: filteredDocument?.documentType }
      : doc?.dropdownData?.length === 1
        ? doc?.dropdownData[0]
        : {},
  )

  const [file, setFile] = useState(null)
  const [uploadedFile, setUploadedFile] = useState(() => filteredDocument?.filestoreId || null)

  const handlePTRSelectDocument = (value) => setSelectedDocument(value)

  function selectfile(e) {
    const selectedFile = e.target.files[0]
    setFile(selectedFile)
    // console.log("selectedFile here", selectedFile, doc, selectedDocument)

    if (selectedFile && selectedFile.type === "image/jpeg") {
      extractGeoLocation(selectedFile).then((location) => {
        // console.log("Latitude:", location.latitude)
        // console.log("Longitude:", location.longitude)

        if (doc?.code === "OWNER.SITEPHOTOGRAPHONE") {
          if (location.latitude !== null && location.longitude !== null) {
            dispatch(UPDATE_LayoutNewApplication_CoOrdinates("Latitude1", location.latitude))
            dispatch(UPDATE_LayoutNewApplication_CoOrdinates("Longitude1", location.longitude))
            setGeoCoordinates((prev) => {
              return {
                ...prev,
                Latitude1: location.latitude,
                Longitude1: location.longitude,
              }
            })
          } else {
            if (window.location.pathname.includes("edit")) {
              dispatch(UPDATE_LayoutNewApplication_CoOrdinates("Latitude1", ""))
              dispatch(UPDATE_LayoutNewApplication_CoOrdinates("Longitude1", ""))
            }
            alert("Please upload a photo with location details.")
          }
        }

        if (doc?.code === "OWNER.SITEPHOTOGRAPHTWO") {
          if (location.latitude !== null && location.longitude !== null) {
            dispatch(UPDATE_LayoutNewApplication_CoOrdinates("Latitude2", location.latitude))
            dispatch(UPDATE_LayoutNewApplication_CoOrdinates("Longitude2", location.longitude))
            setGeoCoordinates((prev) => {
              return {
                ...prev,
                Latitude2: location.latitude,
                Longitude2: location.longitude,
              }
            })
          } else {
            if (window.location.pathname.includes("edit")) {
              dispatch(UPDATE_LayoutNewApplication_CoOrdinates("Latitude2", ""))
              dispatch(UPDATE_LayoutNewApplication_CoOrdinates("Longitude2", ""))
            }
            alert("Please upload a photo with location details.")
          }
        }
      })
    }    
  }

  function selectfileWithCordinates(e) {
    const selectedFile = e.target.files[0]

    if (selectedFile && selectedFile.type === "image/jpeg") {
      extractGeoLocation(selectedFile).then((location) => {
        // console.log("Latitude:", location.latitude)
        // console.log("Longitude:", location.longitude)        

        if (doc?.code === "OWNER.SITEPHOTOGRAPHONE") {
          if (location.latitude !== null && location.longitude !== null) {
            dispatch(UPDATE_LayoutNewApplication_CoOrdinates("Latitude1", location.latitude))
            dispatch(UPDATE_LayoutNewApplication_CoOrdinates("Longitude1", location.longitude))
            setGeoCoordinates((prev) => {
              return {
                ...prev,
                Latitude1: location.latitude,
                Longitude1: location.longitude,
              }
            })
          } else {
            // if (window.location.pathname.includes("edit")) {
            //   dispatch(UPDATE_LayoutNewApplication_CoOrdinates("Latitude1", ""))
            //   dispatch(UPDATE_LayoutNewApplication_CoOrdinates("Longitude1", ""))
            // }
            alert("Please upload a photo with location details.")
            return ;
          }
        }

        if (doc?.code === "OWNER.SITEPHOTOGRAPHTWO") {
          if (location.latitude !== null && location.longitude !== null) {
            dispatch(UPDATE_LayoutNewApplication_CoOrdinates("Latitude2", location.latitude))
            dispatch(UPDATE_LayoutNewApplication_CoOrdinates("Longitude2", location.longitude))
            setGeoCoordinates((prev) => {
              return {
                ...prev,
                Latitude2: location.latitude,
                Longitude2: location.longitude,
              }
            })
          } else {
            // if (window.location.pathname.includes("edit")) {
            //   dispatch(UPDATE_LayoutNewApplication_CoOrdinates("Latitude2", ""))
            //   dispatch(UPDATE_LayoutNewApplication_CoOrdinates("Longitude2", ""))
            // }
            alert("Please upload a photo with location details.")
            return
          }
        }

        setFile(selectedFile)
      })
    }

    
    // console.log("selectedFile here", selectedFile)
  }

  const { dropdownData } = doc
  var dropDownData = dropdownData

  const [isHidden, setHidden] = useState(false)
  const [getLoading, setLoading] = useState(false)

  useEffect(() => {
    if (doc?.code) {
      setDocuments((prev) => {
        const filteredDocumentsByDocumentType = (prev || []).filter(
          (item) => item?.documentType !== doc?.code,
        )

        if (uploadedFile?.length === 0 || uploadedFile === null) {
          return filteredDocumentsByDocumentType
        }

        const filteredDocumentsByFileStoreId =
          filteredDocumentsByDocumentType.filter((item) => item?.filestoreId !== uploadedFile) || []
        return [
          ...filteredDocumentsByFileStoreId,
          {
            documentType: doc?.code,
            filestoreId: uploadedFile,
            documentUid: uploadedFile,
            documentAttachment: uploadedFile,
            order: doc?.order
          },
        ]
      })
    }
  }, [uploadedFile, doc])

  useEffect(() => {
    if ((documents || []).length > 0) {
      // console.log("documents here", documents)
      handleSubmit()
    }
  }, [documents])

  useEffect(() => {
    if (action === "update") {
      const originalDoc = formData?.originalData?.documents?.filter((e) => e.documentType.includes(doc?.code))[0]
      const docType = dropDownData
        .filter((e) => e.code === originalDoc?.documentType)
        .map((e) => ({ ...e, i18nKey: e?.code?.replaceAll(".", "_") }))[0]
      if (!docType) setHidden(true)
      else {
        setSelectedDocument(docType)
        setUploadedFile(originalDoc?.fileStoreId)
      }
    } else if (action === "create") {
    }
  }, [])

  useEffect(() => {
    if (!doc?.hasDropdown) {
      setSelectedDocument({ code: doc?.code, i18nKey: doc?.code?.replaceAll(".", "_") })
    }
  }, [])

  useEffect(() => {
    ;(async () => {
      setError(null)
      if (file) {
        setLoading(true)
        if (file.size >= 5242880) {
          setLoading(false)
          setError(t("CS_MAXIMUM_UPLOAD_SIZE_EXCEEDED"))
        } else {
          try {
            setUploadedFile(null)
            const response = await Digit.UploadServices.Filestorage("BPA", file, Digit.ULBService.getStateId())
            setLoading(false)
            if (response?.data?.files?.length > 0) {
              setUploadedFile(response?.data?.files[0]?.fileStoreId)
            } else {
              setError(t("CS_FILE_UPLOAD_ERROR"))
            }
          } catch (err) {
            setLoading(false)
            setError(t("CS_FILE_UPLOAD_ERROR"))
          }
        }
      }
    })()
  }, [file])

  useEffect(() => {
    if (isHidden) setUploadedFile(null)
  }, [isHidden])

  function convertToDecimal(coordinate) {
    const degrees = coordinate[0]
    const minutes = coordinate[1]
    const seconds = coordinate[2]
    return degrees + minutes / 60 + seconds / 3600
  }

  function extractGeoLocation(file) {
    return new Promise((resolve) => {
      try {
        EXIF.getData(file, function () {
          const lat = EXIF.getTag(this, "GPSLatitude")
          const lon = EXIF.getTag(this, "GPSLongitude")

          // console.log("lat====", lat)
          if (lat && lon) {
            const latDecimal = convertToDecimal(lat).toFixed(6)
            const lonDecimal = convertToDecimal(lon).toFixed(6)
            resolve({ latitude: latDecimal, longitude: lonDecimal })
          } else {
            resolve({ latitude: null, longitude: null })
            if (doc?.code === "OWNER.SITEPHOTOGRAPHONE") {
              alert("Please Upload a Photo with Location Details")
            }
          }
        })
      } catch (error) {
        console.log("EXIF parsing failed:", error)
        resolve({ latitude: null, longitude: null })
      }
    })
  }

  return (
    <div style={{ marginBottom: "24px" }}>
      {getLoading && <Loader />}
        <LabelFieldPair>
          <CardLabel className="card-label-smaller" style={{ width: "100%" }}>
            {t(doc?.code.replaceAll(".", "_"))} {doc?.required && <span className="requiredField">*</span>} 
          </CardLabel>

      <div className="field" style={{display: "flex", flexDirection:"column", gap: "10px"}}>
        {doc?.code === "OWNER.OWNERPHOTO" || doc?.code === "OWNER.SITEPHOTOGRAPHONE" || doc?.code === "OWNER.SITEPHOTOGRAPHTWO" ? (
          <CustomUploadFile
            id={"clu-doc"}
            onUpload={selectfileWithCordinates}
            onDelete={() => {
              setUploadedFile(null);
            }}
            uploadedFile={uploadedFile}
            message={uploadedFile ? `1 ${t(`CS_ACTION_FILEUPLOADED`)}` : t(`CS_ACTION_NO_FILEUPLOADED`)}
            textStyles={{ width: "100%" }}
            accept=".jpeg, .jpg, .png"
          />
        ):(
          <CustomUploadFile
            id={"clu-doc"}
            onUpload={selectfile}
            onDelete={() => {
              setUploadedFile(null);
            }}
            uploadedFile={uploadedFile}
            message={uploadedFile ? `1 ${t(`CS_ACTION_FILEUPLOADED`)}` : t(`CS_ACTION_NO_FILEUPLOADED`)}
            textStyles={{ width: "100%" }}
            accept=".pdf, .jpeg, .jpg, .png"
          />
        )}

            {doc?.code === "OWNER.SITEPHOTOGRAPHONE" &&  (geocoordinates?.Latitude1 && geocoordinates?.Longitude1) &&  <p style={{ padding: "10px", fontSize: "14px" }}>Latitude: {geocoordinates.Latitude1} & Longitude: {geocoordinates.Longitude1} </p>}
            {doc?.code === "OWNER.SITEPHOTOGRAPHTWO" &&  (geocoordinates?.Latitude2 && geocoordinates?.Longitude2) &&  <p style={{ padding: "10px", fontSize: "14px" }}>Latitude: {geocoordinates.Latitude2} & Longitude: {geocoordinates.Longitude2}</p>}
          </div>

      </LabelFieldPair>
    </div>
  )
}

export default LayoutDocumentsRequired

