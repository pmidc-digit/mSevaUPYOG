 import { PTRService } from "../../elements/PTR";


const ApplicationUpdateActionsPTR = async (applicationData, tenantId) => {
  
  
  try {
    const response = await Digit.PTRService.update(applicationData, tenantId);
    return response;
  } catch (error) {
    console.log('error', error)
    throw new Error(error?.response?.data?.Errors[0].message);
  }
};

export default ApplicationUpdateActionsPTR;
