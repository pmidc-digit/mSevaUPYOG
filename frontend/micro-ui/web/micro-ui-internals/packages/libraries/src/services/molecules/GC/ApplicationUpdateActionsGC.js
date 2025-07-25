import { GCService } from "../../elements/GC";

const ApplicationUpdateActionsGC = async (applicationData, tenantId) => {
  try {
    const response = await GCServiceService.update(applicationData, tenantId);
    return response;
  } catch (error) {
    throw new Error(error?.response?.data?.Errors[0].message);
  }
};

export default ApplicationUpdateActionsGC;
