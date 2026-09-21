// Keep the allotment owner record ID when replacing the selected person.
export const mergeRentalOwners = (applicants = [], originalOwners = []) =>
  applicants.filter((owner) => owner?.status !== false && owner?.status !== "false").map((applicant) => {
    const uuid = applicant.uuid || applicant.userUuid || applicant.ownerId;
    const originalOwner = originalOwners.find((owner) => {
      if (applicant.ownerId && owner.ownerId === applicant.ownerId) return true;
      const originalUuid = owner.uuid || owner.userUuid || owner.ownerId;
      if (uuid && originalUuid) return uuid === originalUuid;
      return !!applicant.mobileNumber && applicant.mobileNumber === (owner.mobileNo || owner.mobileNumber) && applicant.name === owner.name;
    }) || {};
    const address = typeof applicant.address === "string" ? applicant.address : "";
    const owner = {
      ...originalOwner,
      ...applicant,
      name: applicant.name,
      mobileNo: applicant.mobileNumber,
      emailId: applicant.emailId,
      panCard: applicant.panNumber,
      ownerId: applicant.ownerId ?? originalOwner.ownerId ?? (originalOwners.length === 1 ? originalOwners[0].ownerId : undefined),
      gender: typeof applicant.gender === "object" && applicant.gender !== null ? applicant.gender.code : applicant.gender,
      dob: 0,
      correspondenceAddress: {
        ...originalOwner.correspondenceAddress,
        pincode: applicant.pincode,
        addressId: address,
        address,
      },
      permanentAddress: {
        ...originalOwner.permanentAddress,
        pincode: applicant.pincode,
        addressId: address,
        address,
      },
    };
    delete owner.status;
    return owner;
  });
