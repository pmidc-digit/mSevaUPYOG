import React, { useEffect, useState } from "react";
import {
  FormStep,
  TextInput,
  CardLabel,
  RadioButtons,
  RadioOrSelect,
  LabelFieldPair,
  Dropdown,
  CheckBox,
  LinkButton,
  Loader,
  Toast,
  SearchIcon,
  DeleteIcon,
  UploadFile,
  ActionBar,
  SubmitBar,
  CustomButton,
  TextArea
} from "@mseva/digit-ui-react-components";
import { stringReplaceAll, getPattern, convertDateTimeToEpoch, convertDateToEpoch } from "../utils";
import Timeline from "../components/Timeline";
import cloneDeep from "lodash/cloneDeep";
import CustomUploadFile from "../components/CustomUploadFile";

const ErrorMessage = ({ message }) => {
  if (!message) return null;
  return <div style={{ color: "red", fontSize: "12px", marginTop: "4px" }}>{message}</div>;
};

const OwnerDetails = ({ t, config, onSelect, userType, formData, currentStepData, onGoBack }) => {
  console.log("formdatatstd", currentStepData)

  let validation = {}
  sessionStorage.removeItem("currentPincode")

  const isedittrade = window.location.href.includes("edit-application")
  const isrenewtrade = window.location.href.includes("renew-trade")

  const tenantId = Digit.ULBService.getCurrentTenantId()
  console.log(tenantId, "OWNER TENET ID")
  const stateId = Digit.ULBService.getStateId()

  const [canmovenext, setCanmovenext] = useState(isedittrade || isrenewtrade ? false : true)
  const [ownershipCategoryList, setOwnershipCategoryList] = useState([])
  const [genderList, setGenderList] = useState([])
  const [documentUploadedFiles, setDocumentUploadedFiles] = useState({})
  const [photoUploadedFiles, setPhotoUploadedFiles] = useState({})
  const [authLetterUploadedFiles, setAuthLetterUploadedFiles] = useState({})
  const [apiLoading, setApiLoading] = useState(false);

  const [errors, setErrors] = useState({})
  const [ownerRoleCheck, setOwnerRoleCheck] = useState(null) // Declare ownerRoleCheck variable

  const setDocumentFile = (index, file) => {
    console.log("OwnerDoc DocumentFile FileUploader", index, file)
    let updatedFields = [...fields]
    console.log("OwnerDoc DocumentFile FileUploader 2", updatedFields)
    updatedFields[index] = {
      ...updatedFields[index],
      additionalDetails: {
        ...(updatedFields[index].additionalDetails || {}),
        documentFile: file,
      },
    };
    setFeilds(updatedFields)
  }

  const selectDocumentFile = (index) => async (e) => {
    const file = e.target.files[0]
    if (file && file.size > 5 * 1024 * 1024) {
      setShowToast({ key: "true", error: true, message: "File size should be less than 5MB" })
      return
    }
    console.log("OwnerDoc DocumentFile", file)
    try {
        const response = await Digit.UploadServices.Filestorage("PT", file, Digit.ULBService.getStateId());
        if (response?.data?.files?.length > 0) {
          setDocumentFile(index, response?.data?.files[0]?.fileStoreId);
          setDocumentUploadedFiles((prev) => ({ ...prev, [index]: response?.data?.files[0]?.fileStoreId }))
          setErrors((prev) => ({ ...prev, [`documentFile_${index}`]: "" }))
        } else {
          setError(t("CS_FILE_UPLOAD_ERROR"));
        }
    } catch (err) {
      setError(t("CS_FILE_UPLOAD_ERROR"));
    }
    // setDocumentFile(index, file)
    // setDocumentUploadedFiles((prev) => ({ ...prev, [index]: file }))
    // setErrors((prev) => ({ ...prev, [`documentFile_${index}`]: "" }))
  }

  const selectPhotoFile = (index) => async (e) => {
    const file = e.target.files[0]
    if (file && file.size > 5 * 1024 * 1024) {
      setShowToast({ key: "true", error: true, message: "File size should be less than 5MB" })
      return
    }
    console.log("OwnerDoc OwnerPhoto", file)
    try {
        const response = await Digit.UploadServices.Filestorage("PT", file, Digit.ULBService.getStateId());
        if (response?.data?.files?.length > 0) {
          setOwnerPhoto(index, response?.data?.files[0]?.fileStoreId);
          setPhotoUploadedFiles((prev) => ({ ...prev, [index]: response?.data?.files[0]?.fileStoreId }))
          setErrors((prev) => ({ ...prev, [`ownerPhoto_${index}`]: "" }))
        } else {
          setError(t("CS_FILE_UPLOAD_ERROR"));
        }
    } catch (err) {
      setError(t("CS_FILE_UPLOAD_ERROR"));
    }
    // setOwnerPhoto(index, file)
    // setPhotoUploadedFiles((prev) => ({ ...prev, [index]: file }))
    // setErrors((prev) => ({ ...prev, [`ownerPhoto_${index}`]: "" }))
  }

  const selectAuthLetterFile = (index) => (e) => {
    const file = e.target.files[0]
    if (file && file.size > 5 * 1024 * 1024) {
      setShowToast({ key: "true", error: true, message: "File size should be less than 5MB" })
      return
    }
    setAuthorizationLetter(index, file)
    setAuthLetterUploadedFiles((prev) => ({ ...prev, [index]: file }))
    setErrors((prev) => ({ ...prev, [`authLetter_${index}`]: "" }))
  }

  const setOwnerPhoto = (index, file) => {
    console.log("OwnerDoc OwnerPhoto PhotoUploader", index, file);
    const updatedFields = [...fields]
    // updatedFields[index].additionalDetails.ownerPhoto = file
    updatedFields[index] = {
      ...updatedFields[index],
      additionalDetails: {
        ...(updatedFields[index].additionalDetails || {}),
        ownerPhoto: file,
      },
    };
    setFeilds(updatedFields)
  }

  const setDateOfBirth = (index, e) => {
    const updatedFields = [...fields]
    updatedFields[index].dob = e.target.value
    setFeilds(updatedFields)
  }

  const setAuthorizedPerson = (index, e) => {
    const updatedFields = [...fields]
    updatedFields[index].authorizedPerson = e.target.value
    setFeilds(updatedFields)
  }

  const setAuthorizationLetter = (index, file) => {
    const updatedFields = [...fields]
    updatedFields[index].authorizationLetter = file
    setFeilds(updatedFields)
  }

  const setOwnerAddress = (index, e) => {
    const updatedFields = [...fields]
    updatedFields[index].permanentAddress = e.target.value
    setFeilds(updatedFields)
  }

  const [documentTypes] = useState([
    { code: "AADHAR", name: "Aadhar Card", i18nKey: "AADHAR_CARD" },
    { code: "PAN", name: "Pan Card", i18nKey: "PAN_CARD" },
    { code: "VOTER", name: "Voter ID", i18nKey: "VOTER_ID" },
    { code: "DRIVING", name: "Driving License", i18nKey: "DRIVING_LICENSE" },
  ])

  // Initialize with sessionStorage data first, then fall back to formData
  const [ownershipCategory, setOwnershipCategory] = useState(() => {
    // const stored = sessionStorage.getItem("ownershipCategory")
    // return stored ? JSON.parse(stored) : formData?.owners?.ownershipCategory
    return currentStepData?.createdResponse?.landInfo?.ownershipCategory || null
  })

  const [name, setName] = useState(() => {
    return sessionStorage.getItem("ownerName") || formData?.owners?.name || ""
  })

  const [emailId, setEmail] = useState(() => {
    return sessionStorage.getItem("ownerEmail") || formData?.owners?.emailId || ""
  })

  const [aadharNumber, setaadharNumber] = useState(() => {
    return sessionStorage.getItem("ownerAadhar") || formData?.owners?.aadharNumber || ""
  })

  const [isPrimaryOwner, setisPrimaryOwner] = useState(false)

  const [gender, setGender] = useState(() => {
    const stored = sessionStorage.getItem("ownerGender")
    return stored ? JSON.parse(stored) : formData?.owners?.gender
  })

  const [mobileNumber, setMobileNumber] = useState(() => {
    return sessionStorage.getItem("ownerMobileNumber") || formData?.owners?.mobileNumber || ""
  })

  const [showToast, setShowToast] = useState(null)
  const [isDisable, setIsDisable] = useState(false)

  const Webview = !Digit.Utils.browser.isMobile()

  const ismultiple = ownershipCategory?.code?.includes("MULTIPLEOWNERS") ? true : false

  formData?.owners?.owners?.forEach((owner) => {
    if (owner.isPrimaryOwner == "false") owner.isPrimaryOwner = false
  })

  const [fields, setFeilds] = useState(() => {
    const owners = currentStepData?.createdResponse?.landInfo?.owners?.map((item) => {
      // console.log("DateofBirth", item, Digit.Utils.date.getDate(item?.dateOfBirth))
      return {
        ...item,
        dob: Digit.Utils.date.getDate(item?.dob)
      }
    });
    if(owners?.length > 0){
      return [...owners]
    }
    return [{ name: "", gender: "", mobileNumber: null, isPrimaryOwner: true },]
  })

  const user = Digit.UserService.getUser()
  console.log("userrrr", user, fields)

  useEffect(() => {
    if(typeof ownershipCategory === "string"){
      const category = ownershipCategoryList.find((item) => item.code === ownershipCategory);
      if(category) setOwnershipCategory(category)
    }else if(ownershipCategory === null){
      if(currentStepData?.createdResponse?.landInfo?.ownershipCategory){
        setOwnershipCategory(currentStepData?.createdResponse?.landInfo?.ownershipCategory)
      }
    }
  }, [ownershipCategory, ownershipCategoryList, currentStepData?.createdResponse?.landInfo?.ownershipCategory])

  useEffect(() => {
    if(fields?.length > 0 && genderList?.length > 0){
      if(typeof fields?.[0]?.gender === "string"){
        const updatedFields = fields?.map((item) => {
          const foundGender = genderList?.find((g) => g?.code === item?.gender);
          if(foundGender){
            return({
              ...item,
              gender: foundGender
            })
          }else{
            return {
              ...item
            }
          }
        });
        setFeilds(updatedFields);
      }
    }
  }, [genderList])

  useEffect(() => {    
    window.scrollTo({
      top: 0,
      behavior: "smooth" // use "auto" for instant scroll
    });      
    try {
      const raw = sessionStorage.getItem("Digit.BUILDING_PERMIT")
      if (!raw) return
      const parsed = JSON.parse(raw)
      const applicantName = parsed?.value?.data?.applicantName ?? parsed?.data?.applicantName ?? parsed?.applicantName

      if (!applicantName || typeof applicantName !== "string") return

      // update single-name state
      setName(applicantName)

      // update first owner's name in fields so the input shows it directly
      setFeilds((prev) => {
        const base =
          Array.isArray(prev) && prev.length
            ? [...prev]
            : [{ name: "", gender: "", mobileNumber: null, isPrimaryOwner: true }]
        base[0] = { ...base[0], name: applicantName }
        return base
      })
    } catch (err) {
      console.log("  Failed reading applicantName from sessionStorage:", err)
    }
  }, [])

  // Persist data to sessionStorage whenever state changes
  useEffect(() => {
    if (ownershipCategory) {
      sessionStorage.setItem("ownershipCategory", JSON.stringify(ownershipCategory))
    }
  }, [ownershipCategory])

  useEffect(() => {
    sessionStorage.setItem("ownerName", name)
  }, [name])

  useEffect(() => {
    sessionStorage.setItem("ownerEmail", emailId)
  }, [emailId])

  useEffect(() => {
    sessionStorage.setItem("ownerAadhar", aadharNumber)
  }, [aadharNumber])

  useEffect(() => {
    if (gender) {
      sessionStorage.setItem("ownerGender", JSON.stringify(gender))
    }
  }, [gender])

  useEffect(() => {
    sessionStorage.setItem("ownerMobileNumber", mobileNumber)
  }, [mobileNumber])

  useEffect(() => {
    sessionStorage.setItem("ownerFields", JSON.stringify(fields))
  }, [fields])

  useEffect(() => {
    var flag = 0
    fields.map((ob) => {
      if (ob?.isPrimaryOwner) flag = 1
      if (ob?.name && ob?.mobileNumber && ob?.gender) {
        setCanmovenext(false)
      } else {
        setCanmovenext(true)
      }
    })
    if (!canmovenext && ownershipCategory && !ownershipCategory?.code?.includes("SINGLEOWNER")) {
      if (flag == 1) setCanmovenext(false)
      else setCanmovenext(true)
    }
  }, [fields])

  useEffect(() => {
    const values = cloneDeep(fields)
    if (ownershipCategory && !ismultiple && values?.length > 1) setFeilds([{ ...values[0], isPrimaryOwner: true }])
  }, [ownershipCategory])

  const { isLoading, data: ownerShipCategories } = Digit.Hooks.obps.useMDMS(stateId, "common-masters", [
    "OwnerShipCategory",
  ])
  const { data: genderTypeData } = Digit.Hooks.obps.useMDMS(stateId, "common-masters", ["GenderType"])

  useEffect(() => {
    const ownershipCategoryLists = ownerShipCategories?.["common-masters"]?.OwnerShipCategory
    if (ownershipCategoryLists && ownershipCategoryLists?.length > 0) {
      const finalOwnershipCategoryList = ownershipCategoryLists.filter((data) => data?.code?.includes("INDIVIDUAL"))
      finalOwnershipCategoryList.forEach((data) => {
        data.i18nKey = `COMMON_MASTERS_OWNERSHIPCATEGORY_${stringReplaceAll(data?.code, ".", "_")}`
      })
      setOwnershipCategoryList(finalOwnershipCategoryList)
    }
  }, [ownerShipCategories])

  useEffect(() => {
    const gendeTypeMenu = genderTypeData?.["common-masters"]?.GenderType || []
    if (gendeTypeMenu && gendeTypeMenu?.length > 0) {
      const genderFilterTypeMenu = gendeTypeMenu.filter((data) => data.active)
      genderFilterTypeMenu.forEach((data) => {
        data.i18nKey = `COMMON_GENDER_${data.code}`
      })
      setGenderList(genderFilterTypeMenu)
    }
  }, [genderTypeData])

  function selectedValue(value) {
    setOwnershipCategory(value)
  }

  function handleAdd() {
    const values = [...fields]
    values.push({ name: "", gender: "", mobileNumber: null, isPrimaryOwner: false })
    setFeilds(values)
    setCanmovenext(true)
  }

  function handleRemove(index) {
    const values = [...fields]
    if (values.length != 1) {
      values.splice(index, 1)
      if (values.length == 1) {
        values[0] = { ...values[0], isPrimaryOwner: true }
      }
      setFeilds(values)
    }
  }

  function setOwnerName(i, e) {
    const units = [...fields]
    units[i].name = e.target.value
    setName(e.target.value)
    setFeilds(units)
    if (units[i].gender && units[i].mobileNumber && units[i].name) {
      setCanmovenext(false)
    }
  }

  function setGenderName(i, value) {
    const units = [...fields]
    units[i].gender = value
    setGender(value)
    setFeilds(units)
    if (units[i].gender && units[i].mobileNumber && units[i].name) {
      setCanmovenext(false)
    }
  }
  function setOwnerEmail(i, e) {
    const units = [...fields]
    units[i].emailId = e.target.value
    setEmail(e.target.value)
    setFeilds(units)
    if (units[i].gender && units[i].mobileNumber && units[i].name) {
      setCanmovenext(false)
    }
  }
  function setAadharNumber(i, e) {
    const units = [...fields]
    units[i].aadharNumber = e.target.value
    setaadharNumber(e.target.value)
    setFeilds(units)
    if (units[i].gender && units[i].mobileNumber && units[i].name) {
      setCanmovenext(false)
    }
  }
  function setMobileNo(i, e) {
    const units = [...fields]
    console.log("OwnerDataOnNumberChange",units[i]);
    units[i] = {
      mobileNumber: e.target.value,
      name: units[i].name,
      gender: units[i].gender,
      emailId: units[i].emailId,
      dob: units[i].dob,
      authorizedPerson: units[i].authorizedPerson,
      permanentAddress: units[i].permanentAddress,
      additionalDetails: units[i].additionalDetails,
      authorizationLetter: units[i].authorizationLetter,
      isPrimaryOwner: units[i].isPrimaryOwner
    } 
    setMobileNumber(e.target.value)
    setFeilds(units)
    if (units[i].gender && units[i].mobileNumber && units[i].name) {
      setCanmovenext(false)
    }
  }
  function setPrimaryOwner(i, e) {
    const units = [...fields]
    units.map((units) => {
      units.isPrimaryOwner = false
    })
    units[i].isPrimaryOwner = ismultiple ? e.target.checked : true
    setisPrimaryOwner(e.target.checked)
    setFeilds(units)
  }
  const [error, setError] = useState(null)

  function getusageCategoryAPI(arr) {
    let usageCat = ""
    arr.map((ob, i) => {
      usageCat = usageCat + (i !== 0 ? "," : "") + ob.code
    })
    return usageCat
  }

  function getUnitsForAPI(subOccupancyData) {
    const ob = subOccupancyData?.subOccupancy
    const blocksDetails = subOccupancyData?.data?.edcrDetails?.planDetail?.blocks || []
    const units = []
    if (ob) {
      const result = Object.entries(ob)
      result.map((unit, index) => {
        units.push({
          blockIndex: index,
          floorNo: unit[0].split("_")[1],
          unitType: "Block",
          occupancyType: blocksDetails?.[index]?.building?.occupancies?.[0]?.typeHelper?.type?.code || "A",
          usageCategory: getusageCategoryAPI(unit[1]),
        })
      })
    }
    return units
  }

  function getBlockIds(arr) {
    const blockId = {}
    arr.map((ob, ind) => {
      blockId[`Block_${ob.floorNo}`] = ob.id
    })
    return blockId
  }

  const closeToast = () => {
    setShowToast(null)
  }

  const getOwnerDetails = async (indexValue, eData) => {
    const ownersCopy = cloneDeep(fields)
    const ownerNo = ownersCopy?.[indexValue]?.mobileNumber || ""
    const ownerId = ownersCopy?.[indexValue]?.ownerId || null
    console.log("ownerNo", ownerNo, indexValue, ownersCopy, eData)
    setShowToast(null)

    if (!ownerNo.match(getPattern("MobileNo"))) {
      setShowToast({ key: "true", error: true, message: "ERR_MOBILE_NUMBER_INCORRECT" })
      return
    }

    if (
      ownerNo === ownersCopy?.[indexValue]?.userName &&
      ownerRoleCheck?.code !== "BPA_ARCHITECT" &&
      ownerRoleCheck?.code !== "BPA_SUPERVISOR"
    ) {
      setShowToast({ key: "true", error: true, message: "ERR_OWNER_ALREADY_ADDED_TOGGLE_MSG" })
      return
    }

    const matchingOwnerIndex = ownersCopy.findIndex((item) => item.userName === ownerNo)

    if (
      matchingOwnerIndex > -1 &&
      ownerRoleCheck?.code !== "BPA_ARCHITECT" &&
      ownerRoleCheck?.code !== "BPA_SUPERVISOR"
    ) {
      setShowToast({ key: "true", error: true, message: "ERR_OWNER_ALREADY_ADDED" })
      return
    } else {
      const usersResponse = await Digit.UserService.userSearch(
        Digit.ULBService.getStateId(),
        { userName: fields?.[indexValue]?.mobileNumber },
        {},
      )
      // const found = usersResponse?.user?.[0]?.roles?.filter(
      //   (el) => el.code === "BPA_ARCHITECT" || el.code === "BPA_SUPERVISOR",
      // )?.[0]
      if (usersResponse?.user?.length === 0) {
        setShowToast({ key: "true", warning: true, message: "ERR_MOBILE_NUMBER_NOT_REGISTERED" })
        return
      } else {
        const userData = usersResponse?.user?.[0]
        userData.gender = userData.gender
          ? { code: userData.gender, active: true, i18nKey: `COMMON_GENDER_${userData.gender}` }
          : ""
        if (userData?.dob) userData.dob = convertDateToEpoch(userData?.dob)
        if (userData?.createdDate) {
          userData.createdDate = convertDateTimeToEpoch(userData?.createdDate)
          userData.lastModifiedDate = convertDateTimeToEpoch(userData?.lastModifiedDate)
          userData.pwdExpiryDate = convertDateTimeToEpoch(userData?.pwdExpiryDate)
        }

        const values = [...ownersCopy]
        if (values[indexValue]) {
          values[indexValue] = userData
          values[indexValue].isPrimaryOwner = fields[indexValue]?.isPrimaryOwner || false
        }
        const updatedValues = values?.map((item, index) => {
          if((index === indexValue) && ownerId){
            return {
              ...item,
              ownerId,
              dob: Digit.Utils.date.getDate(item?.dob)
            }
          }
          return {
            ...item,
            dob: Digit.Utils.date.getDate(item?.dob)
          }
        });
        setFeilds(updatedValues)
        if (values[indexValue]?.mobileNumber && values[indexValue]?.name && values[indexValue]?.gender?.code)
          setCanmovenext(true)
        else setCanmovenext(false)

        if (ownerNo === user?.info?.mobileNumber) {
          setCanmovenext(false)
          //setownerRoleCheck(found);
          setShowToast({ key: "true", error: true, message: `BPA_OWNER_VALIDATION` })
          return
        }
      }
    }
  }

  const getUserData = async (data, tenant) => {
    let flag = false
    let userresponse = []
    userresponse = fields?.map((ob, indexValue) => {
      return Digit.UserService.userSearch(
        Digit.ULBService.getStateId(),
        { userName: fields?.[indexValue]?.mobileNumber },
        {},
      ).then((ob) => {
        return ob
      })
    })
    //getting user data from citizen uuid
    userresponse = await Promise.all(userresponse)
    const foundMobileNo = []
    let found = false
    userresponse &&
      userresponse?.length > 0 &&
      userresponse.map((ob) => {
        found = ob?.user?.[0]?.roles?.filter((el) => el.code === "BPA_ARCHITECT" || el.code === "BPA_SUPERVISOR")?.[0]
        if (
          fields.find(
            (fi) =>
              !(!found) &&
              ((fi?.name === ob?.user?.[0]?.name && fi?.mobileNumber === ob?.user?.[0]?.mobileNumber) ||
                (fi?.mobileNumber === ob?.user?.[0]?.mobileNumber && found)),
          )
        ) {
          flag = true
          foundMobileNo.push(ob?.user?.[0]?.mobileNumber)
        }
      })

    if (foundMobileNo?.length > 0)
      setShowToast({
        key: "true",
        error: true,
        message: `${t("BPA_OWNER_VALIDATION")} ${foundMobileNo?.join(", ")}`,
      })
    if (flag == true) return false
    else return true
  }

  console.log(formData, "FormDATA")

  const validateOwners = (owners, ownershipCategory, setErrors) => {
    let isValid = true;
    let newErrors = {};
    console.log("ownersss", owners)

    // Ownership category mandatory
    if (!ownershipCategory?.code) {
      newErrors["ownershipCategory"] = "Ownership category is mandatory";
      isValid = false;
    }

    // Single owner rule
    if (ownershipCategory?.code === "INDIVIDUAL.SINGLEOWNER" && owners.length !== 1) {
      newErrors["ownersCount"] = "Exactly one owner is required for Single Owner";
      isValid = false;
    }

    // Multiple owner rule
    if (ownershipCategory?.code !== "INDIVIDUAL.SINGLEOWNER" && owners.length <= 1) {
      newErrors["ownersCount"] = "More than one owner is required";
      isValid = false;
    }

    // Mandatory fields for each owner
    owners.forEach((owner, index) => {
      if (!owner?.mobileNumber) {
        newErrors[`mobileNumber_${index}`] = t("Mobile number is required");
        isValid = false;
      }
      if (!owner?.name) {
        newErrors[`name_${index}`] = t("Name is required");
        isValid = false;
      }
      if(owner?.isPrimaryOwner && owner?.name && !(owner?.name?.trim() === currentStepData?.BasicDetails?.edcrDetails?.planDetail?.edcrRequest?.applicantName?.trim())){
        newErrors[`name_${index}`] = t("PRIMARY_OWNER_APPLICANT_NAME_VALIDATION_MESSAGE");
        isValid = false;
      }
      if (!owner?.gender?.code) {
        newErrors[`gender_${index}`] = t("Gender is required");
        isValid = false;
      }
      if(owner?.emailId){
        if(!Digit.Utils.getPattern("Email").test(owner?.emailId)){
          console.log("EmailValidation",owner?.emailId,Digit.Utils.getPattern("Email").test(owner?.emailId))
          newErrors[`email_${index}`] = t("EmailId is incorrect");
          isValid = false;
        }
      }
      if (!owner?.additionalDetails?.documentFile) {
        newErrors[`documentFile_${index}`] = t("Document file is required");
        isValid = false;
      }
      if (!owner?.additionalDetails?.ownerPhoto) {
        newErrors[`ownerPhoto_${index}`] = t("Owner photo is required");
        isValid = false;
      }
      if (!owner?.dob) {
        newErrors[`dob_${index}`] = t("Date of birth is required");
        isValid = false;
      }
      if (!owner?.permanentAddress) {
        newErrors[`address_${index}`] = t("Owner address is required");
        isValid = false;
      }
    });

    setErrors((prev) => ({ ...prev, ...newErrors }));
    return isValid;
  };



  const goNext = async () => {
    setError(null)
    setErrors(null)
    const isValid = validateOwners(fields, ownershipCategory, setErrors);
    if (!isValid) {
      // window.scrollTo(0, 0);
      return;
    }
    setApiLoading(true);
    const moveforward = await getUserData()

    if (!moveforward) {
      setApiLoading(false);
      return
    }

    // if (ismultiple === true && fields.length === 1) {
    //   window.scrollTo(0, 0)
    //   setApiLoading(false);
    //   setError("BPA_ERROR_MULTIPLE_OWNER")
    //   return
    // }


      setIsDisable(true)

      const conversionOwners = []
      fields?.map((owner) => {
        conversionOwners.push({
          ...owner,
          active: true,
          name: owner?.name,
          emailId: owner?.emailId,
          aadharNumber: owner?.aadharNumber,
          mobileNumber: owner?.mobileNumber,
          isPrimaryOwner: owner?.isPrimaryOwner || (fields?.length === 1) ? true : false,
          gender: owner?.gender?.code,
          dob: owner?.dob ? Digit.Utils.pt.convertDateToEpoch(owner?.dob) : null,
          fatherOrHusbandName: owner?.fatherOrHusbandName ||"NAME",
          photo:null
        })
      })

      console.log("ownersData", conversionOwners, ownershipCategory)

      const userInfo = Digit.UserService.getUser()
      const accountId = userInfo?.info?.uuid
      const workflowAction = formData?.data?.applicationNo ? "SAVE_AS_DRAFT" : "INITIATE";

          try{
        setApiLoading(true);
        const result = await Digit.OBPSService.update({ BPA: {
          ...currentStepData?.createdResponse,
          landInfo: {
            ...currentStepData?.createdResponse?.landInfo,
            owners: conversionOwners,
            ownershipCategory: ownershipCategory?.code
          },
          workflow: {
            action: workflowAction,
            assignes: [accountId]
          }
        } }, tenantId)
        if(result?.ResponseInfo?.status === "successful"){
          setApiLoading(false);
          onSelect("");
        }else{
          alert(t("BPA_CREATE_APPLICATION_FAILED"));
          setApiLoading(false);
        }
        console.log("APIResponse", result);
      }catch(e){
        console.log("error", e);
        alert(t("BPA_CREATE_APPLICATION_FAILED"));
        setApiLoading(false);
      }
  }

  const onSkip = () => onSelect()

  // if (isLoading) {
  //     return <Loader />
  // }

  console.log(formData, "DATA++++++")
  function getCanMoveNextMultiple() {
    let flag = 0
    fields &&
      fields?.map((ob) => {
        if (flag !== 1 && (!ob?.name || !ob?.mobileNumber || !ob?.gender?.code)) flag = 1
      })
    if (flag == 0) return false
    else return true
  }



      // ---------------- UI Styles ----------------
      const pageStyle = {
        padding: "2rem",
        backgroundColor: "#f1f1f1ff",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        color: "#333",
        paddingBottom: "5rem",
      };
    
      const sectionStyle = {
        backgroundColor: "#ffffff",
    
        borderRadius: "8px",
     
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
      };
    
      const headingStyle = {
        fontSize: "1.5rem",
        borderBottom: "2px solid #ccc",
        paddingBottom: "0.3rem",
        color: "#2e4a66",
        marginTop: "2rem",
        marginBottom: "1rem",
      };
    
      const labelFieldPairStyle = {
        display: "flex",
        justifyContent: "space-between",
        borderBottom: "1px dashed #e0e0e0",
        padding: "0.5rem 0",
        color: "#333",
      };
    
      const documentsContainerStyle = {
        display: "flex",
        flexWrap: "wrap",
        gap: "1rem",
        
      };
    
      const documentCardStyle = {
    
        minWidth: "200px",
        maxWidth: "250px",
        backgroundColor: "#fdfdfd",
        padding: "0.75rem",
        border: "1px solid #e0e0e0",
        borderRadius: "6px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        justifyContent:"center",
        display:"flex",
        
      };
    
      const boldLabelStyle = { fontWeight: "bold", color: "#555" };
    
      const renderLabel = (label, value) => (
        <div style={labelFieldPairStyle}>
          <CardLabel style={boldLabelStyle}>{label}</CardLabel>
          <div>{value || t("CS_NA")}</div>
        </div>
      );

      function routeTo(filestoreId) {
        getUrlForDocumentView(filestoreId)
      }

      const getUrlForDocumentView = async (filestoreId) => {
        if (filestoreId?.length === 0) return;
        try {
          const result = await Digit.UploadServices.Filefetch([filestoreId], stateId);
          if (result?.data) {
            const fileUrl = result.data[filestoreId];
            if (fileUrl) {
              window.open(fileUrl, "_blank");
            } else {
              setError(t("CS_FILE_FETCH_ERROR"));
            }
          }else {
            setError(t("CS_FILE_FETCH_ERROR"));
          }
        } catch (e) {
          setError(t("CS_FILE_FETCH_ERROR"));
        } 
      }
  
  if(apiLoading) return (<Loader />)

  return (
    <div>
      {/* {!Webview && <Timeline currentStep={3} />} */}
      <FormStep
        config={{...config, texts:{header: "BPA_OWNER_AND_DOCUMENT_DETAILS_LABEL"}}}
        onSelect={goNext}
        onSkip={onSkip}
        t={t}
        isDisabled={canmovenext || getCanMoveNextMultiple() || !ownershipCategory || isDisable}
        forcedError={t(error)}
      >
        {!isLoading ? (
          <div style={{ marginBottom: "10px" }}>
            <div>
              <CardLabel>{`${t("BPA_TYPE_OF_OWNER_LABEL")} *`}</CardLabel>
              <RadioButtons
                isMandatory={true}
                options={ownershipCategoryList}
                selectedOption={ownershipCategory}
                optionsKey="i18nKey"
                onSelect={selectedValue}
                value={ownershipCategory}
                labelKey="PT_OWNERSHIP"
                isDependent={true}
              />
            </div>
            {fields.map((field, index) => {
              return (
                <div key={`${field}-${index}`}>
                  <div
                    style={{
                      border: "solid",
                      borderRadius: "5px",
                      padding: "10px",
                      paddingTop: "20px",
                      marginTop: "10px",
                      borderColor: "#f3f3f3",
                      background: "#FAFAFA",
                    }}
                  >
                    <CardLabel style={{ marginBottom: "-15px" }}>{`${t("CORE_COMMON_MOBILE_NUMBER")} *`}</CardLabel>
                    {ismultiple && (
                      <LinkButton
                        label={
                          <DeleteIcon
                            style={{  bottom: "5px" }}
                            fill={!(fields.length == 1) ? "#494848" : "#FAFAFA"}
                          />
                        }
                        style={{ width: "50px", display: "inline",justifyContent:"center", alighItem:"center", background: "black", float:"right" }}
                        onClick={(e) => handleRemove(index)}
                      />
                    )}
                    <div style={{ marginTop: "30px" }}>
                      <div className="field-container">
                        <div
                          style={{
                            marginBottom: "24px",
                            padding: "3px 2px",
                            border: "1px solid #b4b4b4",
                            borderRadius: "8px 0px 0px 8px"
                          }}
                        >
                          +91
                        </div>
                        <TextInput
                          style={{ background: "#FAFAFA", padding: "0px 4px", borderRadius: "0px 8px 8px 0px", width: "96%"  }}
                          type={"text"}
                          t={t}
                          isMandatory={false}
                          optionKey="i18nKey"
                          name="mobileNumber"
                          value={field.mobileNumber}
                          onChange={(e) => setMobileNo(index, e)}
                          {...(validation = {
                            isRequired: true,
                            pattern: "[6-9]{1}[0-9]{9}",
                            type: "tel",
                            title: t("CORE_COMMON_APPLICANT_MOBILE_NUMBER_INVALID"),
                          })}
                        />
                        <div
                          style={{
                            position: "relative",
                            zIndex: "100",
                            right: "44px",
                            marginTop: "-24px",
                            marginRight: Webview ? "-20px" : "-20px",
                          }}
                          onClick={(e) => getOwnerDetails(index, e)}
                        >
                          {" "}
                          <SearchIcon />{" "}
                        </div>
                        <ErrorMessage message={errors[`mobileNumber_${index}`]} />
                      </div>
                    </div>
                    <CardLabel>{`${t("CORE_COMMON_NAME")} *`}</CardLabel>
                    <TextInput
                      style={{ background: "#FAFAFA" }}
                      t={t}
                      type={"text"}
                      isMandatory={false}
                      optionKey="i18nKey"
                      name="name"
                      value={field.name}
                      onChange={(e) => setOwnerName(index, e)}
                      {...(validation = {
                        isRequired: true,
                        pattern: "^[a-zA-Z ]*$",
                        type: "text",
                        title: t("TL_NAME_ERROR_MESSAGE"),
                      })}
                    />
                    <ErrorMessage message={errors[`name_${index}`]} />
                    <CardLabel>{`${t("BPA_APPLICANT_GENDER_LABEL")} *`}</CardLabel>
                    <RadioOrSelect
                      name="gender"
                      options={genderList}
                      selectedOption={field.gender}
                      optionKey="i18nKey"
                      onSelect={(e) => setGenderName(index, e)}
                      t={t}
                    />
                    <ErrorMessage message={errors[`gender_${index}`]} />
                    {/* <CardLabel>{`${t("BPA_AADHAAR_NUMBER_LABEL_NEW")}`}</CardLabel>
                    <TextInput
                      style={{ background: "#FAFAFA" }}
                      t={t}
                      type={"text"}
                      isMandatory={false}
                      optionKey="i18nKey"
                      name="aadharNumber"
                      value={field.aadharNumber}
                      onChange={(e) => setAadharNumber(index, e)}
                      {...(validation = {
                        pattern: "^[2-9]{1}[0-9]{3}[0-9]{4}[0-9]{4}$",
                        type: "tel",
                        title: t("INVALID_AADHAAR_NUMBER"),
                      })}
                    /> */}
                    <CardLabel>{`${t("CORE_EMAIL_ID")}`}</CardLabel>
                    <TextInput
                      style={{ background: "#FAFAFA" }}
                      t={t}
                      type={"emailId"}
                      isMandatory={false}
                      optionKey="i18nKey"
                      name="emailId"
                      value={field.emailId}
                      onChange={(e) => setOwnerEmail(index, e)}
                      {...(validation = {
                        //isRequired: true,
                        pattern: "[A-Za-z0-9._%+-]+@[a-z0-9.-]+.[a-z]{2,4}$",
                        type: "emailId",
                        title: t("TL_EMAIL_ID_ERROR_MESSAGE"),
                      })}
                      disabled={false}
                      //disabled={true}
                    />
                    <ErrorMessage message={errors[`email_${index}`]} />
                    {/* <CardLabel>{`Document Type *`}</CardLabel>
                    <Dropdown
                      option={documentTypes}
                      selected={field.documentType}
                      optionKey="i18nKey"
                      onSelect={(value) => setDocumentType(index, value)}
                      t={t}
                      placeholder="Select Document Type"
                    />
                    <ErrorMessage message={errors[`documentType_${index}`]} /> */}

                    <CardLabel
                      style={{ marginTop: "30px" }}
                    >{`${t("Upload Valid ID Copy (PAN/Voter ID/ Driving License) (PDF, Max 5MB)")} *`}</CardLabel>
                    <div style={{display:"flex", flexDirection:Webview?"row":"column", gap:"15px"}}>
                    <CustomUploadFile
                      id={`document-upload-${index}`}
                      onUpload={selectDocumentFile(index)}
                      onDelete={() => {
                        setDocumentFile(index, null)
                        setDocumentUploadedFiles((prev) => ({ ...prev, [index]: null }))
                        setErrors((prev) => ({ ...prev, [`documentFile_${index}`]: "Document upload is required" }))
                      }}
                      uploadedFile={fields?.[index]?.additionalDetails?.documentFile || documentUploadedFiles[index]}
                      message={fields?.[index]?.additionalDetails?.documentFile || documentUploadedFiles[index] ? `1 ${t("FILEUPLOADED")}` : t("ES_NO_FILE_SELECTED_LABEL")}
                      error={errors[`documentFile_${index}`]}
                      uploadMessage=""
                      accept=".pdf"
                    />
                    {/* {fields?.[index]?.additionalDetails?.documentFile ? <div>
                      <SubmitBar onSubmit={() => {routeTo(fields?.[index]?.additionalDetails?.documentFile)}} label={t("CS_VIEW_DOCUMENT")} />
                    </div> : null } */}
                    </div>
                    <ErrorMessage message={errors[`documentFile_${index}`]} />

                    <CardLabel style={{ marginTop: "30px" }}>{`${t("Upload Owner Photo")} *`}</CardLabel>
                    <div style={{display:"flex", flexDirection:Webview?"row":"column", gap:"15px"}}>
                    <CustomUploadFile
                      id={`photo-upload-${index}`}
                      onUpload={selectPhotoFile(index)}
                      onDelete={() => {
                        setOwnerPhoto(index, null)
                        setPhotoUploadedFiles((prev) => ({ ...prev, [index]: null }))
                        setErrors((prev) => ({ ...prev, [`ownerPhoto_${index}`]: "Owner photo is required" }))
                      }}
                      uploadedFile={fields?.[index]?.additionalDetails?.ownerPhoto || photoUploadedFiles[index]}
                      message={fields?.[index]?.additionalDetails?.ownerPhoto || photoUploadedFiles[index]? `1 ${t("FILEUPLOADED")}` : t("ES_NO_FILE_SELECTED_LABEL")}
                      error={errors[`ownerPhoto_${index}`]}
                      uploadMessage=""
                      accept="image/*"
                    />
                    {/* {fields?.[index]?.additionalDetails?.ownerPhoto ? <div>
                      <SubmitBar onSubmit={() => {routeTo(fields?.[index]?.additionalDetails?.ownerPhoto)}} label={t("CS_VIEW_DOCUMENT")} />
                    </div> : null } */}
                    </div>
                    <ErrorMessage message={errors[`ownerPhoto_${index}`]} />

                    <CardLabel style={{ marginTop: "30px" }}>{`${t("Date of Birth")} *`}</CardLabel>
                    <TextInput
                      style={{ background: "#FAFAFA" }}
                      t={t}
                      type={"date"}
                      isMandatory={false}
                      name="dob"
                      value={field.dob}
                      onChange={(e) => setDateOfBirth(index, e)}
                    />
                    <ErrorMessage message={errors[`dob_${index}`]} />

                    <CardLabel>{`${t("Authorized Person (If Any)")}`}</CardLabel>
                    <TextInput
                      style={{ background: "#FAFAFA" }}
                      t={t}
                      type={"text"}
                      isMandatory={false}
                      name="authorizedPerson"
                      value={field.authorizedPerson}
                      onChange={(e) => setAuthorizedPerson(index, e)}
                      {...(validation = {
                        pattern: "^[a-zA-Z ]*$",
                        type: "text",
                        title: "Invalid name format",
                      })}
                    />

                    {field.authorizedPerson && (
                      <React.Fragment>
                        <CardLabel>{`${t("Authorization Letter (PDF, Max 5MB)")}`}</CardLabel>
                        <CustomUploadFile
                          id={`auth-letter-${index}`}
                          onUpload={selectAuthLetterFile(index)}
                          onDelete={() => {
                            setAuthorizationLetter(index, null)
                            setAuthLetterUploadedFiles((prev) => ({ ...prev, [index]: null }))
                            if (field.authorizedPerson) {
                              setErrors((prev) => ({
                                ...prev,
                                [`authLetter_${index}`]:
                                  "Authorization letter is required when authorized person is specified",
                              }))
                            }
                          }}
                          uploadedFile={authLetterUploadedFiles[index]}
                          message={
                            authLetterUploadedFiles[index] ? `1 ${t("FILEUPLOADED")}` : t("ES_NO_FILE_SELECTED_LABEL")
                          }
                          uploadMessage=""
                          accept=".pdf"
                        />
                        <ErrorMessage message={errors[`authLetter_${index}`]} />
                      </React.Fragment>
                    )}

                    <CardLabel>{`${t("Owner's Address")} *`}</CardLabel>
                    <textarea
                      style={{
                        background: "#FAFAFA",
                        width: "100%",
                        minHeight: "80px",
                        padding: "8px",
                        border: "1px solid #ccc",
                        borderRadius: "4px",
                        resize: "vertical",
                      }}
                      placeholder="Enter complete address"
                      value={field?.permanentAddress || ""}
                      onChange={(e) => setOwnerAddress(index, e)}
                    />
                    <ErrorMessage message={errors[`address_${index}`]} />

                    {ismultiple && (
                      <CheckBox
                        label={t("BPA_IS_PRIMARY_OWNER_LABEL")}
                        onChange={(e) => setPrimaryOwner(index, e)}
                        value={field.isPrimaryOwner}
                        checked={field.isPrimaryOwner}
                        style={{ paddingTop: "10px" }}
                      />
                    )}
                  </div>
                </div>
              )
            })}
            {ismultiple ? (
              <div>
                <div style={{ display: "flex", paddingBottom: "15px", color: "#FF8C00" }}>
                  <button type="button" style={{ paddingTop: "10px" }} onClick={() => handleAdd()}>
                    {t("BPA_ADD_OWNER")}
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        ) : (
          <Loader />
        )}
      </FormStep>
      <ActionBar>
        <SubmitBar
                                              label="Back"
                                              style={{
                                                border: "1px solid",
                                                background: "transparent",
                                                color: "#2947a3",
                                                marginRight: "5px",
                                              }}
                                              onSubmit={onGoBack}
                                    />
          {<SubmitBar label={t(`CS_COMMON_NEXT`)} onSubmit={goNext} disabled={apiLoading || canmovenext || getCanMoveNextMultiple() || !ownershipCategory || isDisable}/>}
      </ActionBar>
      {showToast && (
        <Toast
          error={showToast?.error}
          warning={showToast?.warning}
          label={t(showToast?.message)}
          isDleteBtn={true}
          onClose={closeToast}
        />
      )}
    </div>



  )
}

export default OwnerDetails