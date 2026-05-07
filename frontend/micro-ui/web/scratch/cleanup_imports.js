const fs = require('fs');

// Reason.js
const reasonPath = 'micro-ui-internals/packages/modules/swach/src/pages/citizen/ReopenComplaint/Reason.js';
let reasonContent = fs.readFileSync(reasonPath, 'utf8');
reasonContent = reasonContent.replace(/import { getRoute, PgrRoutes, PGR_BASE } from "..\\/..\\/..\\/constants\\/Routes";/g, "");
fs.writeFileSync(reasonPath, reasonContent, 'utf8');

// Response.js (Employee)
const responsePath = 'micro-ui-internals/packages/modules/swach/src/pages/employee/Response.js';
let responseContent = fs.readFileSync(responsePath, 'utf8');
responseContent = responseContent.replace(/import { PgrRoutes, getRoute } from "..\\/..\\/constants\\/Routes";/g, "");
fs.writeFileSync(responsePath, responseContent, 'utf8');

// index.js (Create)
const createIndexPath = 'micro-ui-internals/packages/modules/swach/src/pages/citizen/Create/index.js';
let createIndexContent = fs.readFileSync(createIndexPath, 'utf8');
createIndexContent = createIndexContent.replace(/import { PGR_CITIZEN_COMPLAINT_CONFIG, SWACH_CITIZEN_CREATE_COMPLAINT } from "..\\/..\\/..\\/constants\\/Citizen";/g, 'import { SWACH_CITIZEN_CREATE_COMPLAINT } from "../../../constants/Citizen";');
fs.writeFileSync(createIndexPath, createIndexContent, 'utf8');

console.log("Cleanup finished.");
