const fs = require('fs');
const path = require('path');

const base = 'micro-ui-internals/packages/modules';

function fixFile(filePath, removals, replacements) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  
  // Remove specific import names from import statements
  removals.forEach(function(r) {
    if (content.includes(r)) {
      content = content.replace(r, '');
      changed = true;
      console.log('Removed "' + r + '" from ' + filePath);
    }
  });
  
  // Do full line replacements
  if (replacements) {
    replacements.forEach(function(pair) {
      if (content.includes(pair[0])) {
        content = content.replace(pair[0], pair[1]);
        changed = true;
        console.log('Replaced in ' + filePath);
      }
    });
  }
  
  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
  }
  return changed;
}

// 1. mCollect ConsumerDetails & ServiceDetails - remove broken imports
['ConsumerDetails', 'ServiceDetails'].forEach(function(f) {
  fixFile(base + '/mCollect/src/pageComponents/' + f + '.js', 
    ['getUniqueItemsFromArray, ', ', commonTransform', ', getPattern'],
    null
  );
});

// 2. NDC ApplicationOverview - remove TLTimeLine and StarRated
fixFile(base + '/ndc/src/pages/citizen/ApplicationOverview/index.js',
  ['  TLTimeLine,\n', '  StarRated,\n'],
  null
);

// 3. OBPS Documents - remove getDocumentsName
fixFile(base + '/obps/src/pageComponents/OBPSDocuments.js',
  [', getDocumentsName'],
  null
);

// 4. PT - UPDATE_PtNewApplication
['employee/EditApplication/PTEditFormSummaryStepFive.js', 
 'employee/NewApplication/NewApplicationStepForm/PTNewFormSummaryStepFive.js'].forEach(function(f) {
  fixFile(base + '/pt/src/pages/' + f,
    ['UPDATE_PtNewApplication, ', ', UPDATE_PtNewApplication'],
    null
  );
});

// 5. PTR - cardBodyStyle
fixFile(base + '/ptr/src/pageComponents/PTRServiceDoc.js',
  ['cardBodyStyle, ', ', cardBodyStyle'],
  null
);

// 6. Swach Attendence and ViewAttendence - remove Button and LinkButton
['Attendence.js', 'ViewAttendence.js'].forEach(function(f) {
  fixFile(base + '/swach/src/pages/citizen/' + f,
    ['import { LinkButton, Button } from "@mseva/digit-ui-react-components";\n',
     'import { LinkButton, Button } from "@mseva/digit-ui-react-components";\r\n'],
    null
  );
});

// 7. WS - successSvg
['WSDisconnectAcknowledgement.js', 'WSRestorationAcknowledgement.js'].forEach(function(f) {
  fixFile(base + '/ws/src/pageComponents/' + f,
    [', successSvg'],
    null
  );
});

// 8. WS - getCommencementDataFormat
fixFile(base + '/ws/src/pages/citizen/EditApplication/index.js',
  ['getCommencementDataFormat, ', ', getCommencementDataFormat'],
  null
);

// 9. WS - propertyCardBodyStyle
fixFile(base + '/ws/src/pages/citizen/WSMyApplications/index.js',
  null,
  [['import { propertyCardBodyStyle } from "../../../utils";\n', ''],
   ['import { propertyCardBodyStyle } from "../../../utils";\r\n', '']]
);

console.log('\nDone! All fixes applied.');
