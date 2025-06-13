export const SWACH_BASE = "/digit-ui/swach/citizen/";

const CREATE_COMPLAINT_PATH = "/create-complaint/";
const REOPEN_COMPLAINT_PATH = "/reopen/";
import { SWACH_EMPLOYEE_COMPLAINT_DETAILS, SWACH_EMPLOYEE_CREATE_COMPLAINT } from "./Employee";

export const SwachRoutes = {
  ComplaintsPage: "/complaints",
  RatingAndFeedBack: "/rate/:id*",
  ComplaintDetailsPage: "/complaint/details/:id",
  ReasonPage: `/reopen/:id`,
  UploadPhoto: `/reopen/upload-photo/:id`,
  AddtionalDetails: `/reopen/addional-details/:id`,
  CreateComplaint: "/create-complaint",
  ReopenComplaint: "/reopen",
  Response: "/response",

  CreateComplaintStart: "",
  SubType: `/subtype`,
  LocationSearch: `/location`,
  Pincode: `/pincode`,
  Address: `/address`,
  Landmark: `/landmark`,
  UploadPhotos: `/upload-photos`,
  Details: `/details`,
  CreateComplaintResponse: `/response`,
  EditApplication: "/modify-application"
};

export const Employee = {
  Inbox: "/inbox",
  ComplaintDetails: SWACH_EMPLOYEE_COMPLAINT_DETAILS,
  CreateComplaint: SWACH_EMPLOYEE_CREATE_COMPLAINT,
  Response: "/response",
  Home: "/digit-ui/employee",
  EditApplication: "/modify-application"
};

export const getRoute = (match, route) => `${match.path}${route}`;
