const fs = require('fs');
const path = 'micro-ui-internals/packages/modules/swach/src/constants/Citizen.js';
const content = `export const SWACH_CITIZEN_CREATE_COMPLAINT = "SWACH_CITIZEN_CREATE_COMPLAINT";
export const SWACH_CITIZEN_COMPLAINT_CONFIG = "SWACH_CITIZEN_COMPLAINT_CONFIG";
export const PGR_CITIZEN_COMPLAINT_CONFIG = "PGR_CITIZEN_COMPLAINT_CONFIG";
export const PGR_CITIZEN_CREATE_COMPLAINT = "PGR_CITIZEN_CREATE_COMPLAINT";
`;
fs.writeFileSync(path, content, 'utf8');

const pathRoutes = 'micro-ui-internals/packages/modules/swach/src/constants/Routes.js';
const contentRoutes = `export const SWACH_BASE = "/digit-ui/swach/citizen/";
export const PGR_BASE = "/digit-ui/pgr/citizen/";
export const PgrRoutes = {
    ComplaintsPage: "/complaints",
    RatingAndFeedBack: "/rate/:id*",
    ComplaintDetailsPage: "/complaint/details/:id",
    ReasonPage: "/reopen/:id",
};
export const SwachRoutes = {
    ComplaintsPage: "/complaints",
    RatingAndFeedBack: "/rate/:id*",
    ComplaintDetailsPage: "/complaint/details/:id",
    ReasonPage: "/reopen/:id",
};
export const getRoute = (match, route) => \`\${match.path}\${route}\`;
export const Employee = {
  Inbox: "/inbox",
  Home: "/digit-ui/employee",
};
`;
fs.writeFileSync(pathRoutes, contentRoutes, 'utf8');
console.log("Files written successfully with Node.js");
