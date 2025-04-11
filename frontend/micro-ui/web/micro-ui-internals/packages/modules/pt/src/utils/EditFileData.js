import React from 'react'

const mapApplicationDataToDefaultValues = (props) => {
    // object that will show data in edit form
    // Assume "applicationData" is the object from your API.
// The following object ("editStepperData") is structured to match your formData
// so that each step in the stepper is pre-populated with the corresponding values.

const editStepperData = {
    "LocationDetails": {
      "address": {
        "doorNo": applicationData.address.doorNo, // "7fdfd"
        "buildingName": applicationData.address.buildingName, // "hfjd"
        "street": applicationData.address.street, // "dhf"
        "pincode": applicationData.address.pincode, // "876322"
        "locality": {
          "code": applicationData.address.locality.code, // e.g., "SC3"
          "name": applicationData.address.locality.name, // e.g., "Kartar Nagar - B2 - A1"
          "label": applicationData.address.locality.label, // "Locality"
          // If needed, add latitude, longitude, etc.
          "latitude": applicationData.address.locality.latitude || null,
          "longitude": applicationData.address.locality.longitude || null,
          "area": applicationData.address.locality.area || "",
          "pincode": applicationData.address.pincode || "",
          "boundaryNum": 1,
          "children": [],
          "i18nkey": applicationData.address.locality.i18nkey || applicationData.address.locality.label
        },
        "city": {
          // Retain default values from your formData unless you have a lookup
          "i18nKey": "TENANT_TENANTS_PB_TESTING",
          "code": "pb.testing",
          "name": applicationData.address.city, // "Testing"
          "description": applicationData.address.city,
          "logoId": "https://pb-egov-assets.s3.ap-south-1.amazonaws.com/pb.testing/logo.png",
          "imageId": null,
          "domainUrl": "https://mseva.lgpunjab.gov.in/",
          "type": "CITY",
          "twitterUrl": null,
          "facebookUrl": null,
          "emailId": "eonpTesting@gmail.com",
          "OfficeTimings": {
            "Mon - Fri": "9.00 AM - 5.00 PM"
          },
          "city": {
            "name": applicationData.address.city,
            "localName": applicationData.address.city,
            "districtCode": "10",
            "districtTenantCode": "pb.jalandhar",
            "districtName": "Jalandhar",
            "regionName": "Jalandhar Region",
            "ulbGrade": "NP",
            "ulbType": "Nagar Panchayat",
            "longitude": 75.3383,
            "latitude": 31.0824,
            "shapeFileLocation": null,
            "captcha": null,
            "code": "1012",
            "ddrName": null,
            "pwssb": false,
            "pwssbGrade": "Nagar Panchayat"
          },
          "address": applicationData.address.landmark || "",
          "contactNumber": "", // You can map a contact number if available
          "PGRMasterContact": "not available"
        }
      },
      // Map propertyId (from applicationData) to "existingPropertyId"
      "existingPropertyId": applicationData.propertyId, // "PT-1012-1004593"
      "surveyId": applicationData.surveyId, // could be null
      "yearOfCreation": {
        "i18nKey": "2013-14",
        "code": "2013-14",
        "value": "2013-14"
      }
    },
    "PropertyDetails": {
      "usageCategoryMajor": {
        // You may define a lookup or keep the API value.
        "i18nKey": "",
        "code": applicationData.usageCategory // "NONRESIDENTIAL.COMMERCIAL"
      },
      "PropertyType": {
        "i18nKey": "",
        "code": applicationData.propertyType // "BUILTUP.SHAREDPROPERTY"
      },
      "landarea": applicationData.landArea, // Might be null; consider defaults if needed.
      "vasikaDetails": {
        "vasikaNo": applicationData.additionalDetails?.vasikaNo, // "7"
        "vasikaDate": applicationData.additionalDetails?.vasikaDate // "2020-11-28T18:30:00.000Z"
      },
      "allottmentDetails": {
        "AllotmentNo": applicationData.additionalDetails?.allotmentNo, // "3"
        "AllotmentDate": applicationData.additionalDetails?.allotmentDate, // "2020-12-08T18:30:00.000Z"
        "allotmentNo": applicationData.additionalDetails?.allotmentNo,
        "allotmentDate": applicationData.additionalDetails?.allotmentDate
      },
      "businessName": applicationData.additionalDetails?.businessName, // "dhfdj"
      "remarks": applicationData.additionalDetails?.remrks, // note the spelling difference ("remrks" vs "remarks")
      "noOfFloors": applicationData.noOfFloors, // 2
      "units": applicationData.units.map(unit => ({
        "floorNo": unit.floorNo.toString(), // converting numeric to string if required
        "constructionDetail": {
          "builtUpArea": unit.constructionDetail.builtUpArea
            ? unit.constructionDetail.builtUpArea.toString()
            : ""
        },
        // If unit.tenantId is not available, default to the top-level tenantId
        "tenantId": unit.tenantId || applicationData.tenantId
      }))
    },
    "ownerShipDetails": {
      "ownershipCategory": {
        "label": "Individual - SingleOwner",
        "value": applicationData.ownershipCategory, // "INDIVIDUAL.SINGLEOWNER"
        "code": applicationData.ownershipCategory,
        "i18nKey": "PT_OWNERSHIP_SINGLEOWNER"
      },
      "owners": applicationData.owners.map(owner => ({
        "name": owner.name, // "Sarika"
        "mobileNumber": owner.mobileNumber, // "9111111111"
        "fatherOrHusbandName": owner.fatherOrHusbandName, // "ff"
        "emailId": owner.emailId, // might be null
        "permanentAddress": owner.permanentAddress,
        // Convert a raw relationship string into the expected object format.
        "relationship": {
          "i18nKey": owner.relationship === "Husband" ? "PT_FORM3_HUSBAND" : "PT_FORM3_FATHER",
          "code": owner.relationship ? owner.relationship.toUpperCase() : "FATHER"
        },
        "ownerType": {
          "i18nKey": "NONE",
          "code": owner.ownerType || "NONE",
          "order": 0
        },
        "gender": {
          "i18nKey": `PT_FORM3_${owner.gender}`.toUpperCase(), // e.g., "PT_FORM3_MALE"
          "code": owner.gender,
          "value": owner.gender
        },
        "isCorrespondenceAddress": false, // default as per your formData
        // Use a unique key, for instance the existing uuid or a fallback.
        "key": owner.uuid || new Date().getTime(), 
        "institution": {
          "type": {
            "active": true,
            "i18nKey": "COMMON_MASTERS_OWNERSHIPCATEGORY_",
            "name": "COMMON_MASTERS_OWNERSHIPCATEGORY_"
          }
        },
        "correspondenceAddress": owner.correspondenceAddress
      }))
    },
    "DocummentDetails": {
      "documents": {
        "documents": applicationData.documents.map(doc => ({
          "documentType": doc.documentType,
          "fileStoreId": doc.fileStoreId,
          "documentUid": doc.documentUid
        })),
        // Using the count of documents provided in the API.
        "propertyTaxDocumentsLength": applicationData.documents.length
      }
    }
  };
  
  // Now, editStepperData can be used to pre-populate your multi-step edit form.
  
  return null;
}

export default mapApplicationDataToDefaultValues