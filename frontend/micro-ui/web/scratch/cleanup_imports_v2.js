const fs = require('fs');

function cleanup(filePath, target) {
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        if (content.includes(target)) {
            content = content.replace(target, "");
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`Cleaned up ${filePath}`);
        } else {
            console.log(`Target not found in ${filePath}`);
        }
    } else {
        console.log(`File not found: ${filePath}`);
    }
}

cleanup('micro-ui-internals/packages/modules/swach/src/pages/citizen/ReopenComplaint/Reason.js', 'import { getRoute, PgrRoutes, PGR_BASE } from "../../../constants/Routes";');
cleanup('micro-ui-internals/packages/modules/swach/src/pages/employee/Response.js', 'import { PgrRoutes, getRoute } from "../../constants/Routes";');
cleanup('micro-ui-internals/packages/modules/swach/src/pages/citizen/Create/index.js', 'import { PGR_CITIZEN_COMPLAINT_CONFIG, SWACH_CITIZEN_CREATE_COMPLAINT } from "../../../constants/Citizen";');

console.log("Cleanup attempt finished.");
