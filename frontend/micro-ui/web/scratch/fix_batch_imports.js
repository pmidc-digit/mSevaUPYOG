const fs = require('fs');
const path = require('path');

// Fix broken named imports by scanning all JS files
const base = 'micro-ui-internals/packages/modules';
const reactComponentsBase = 'micro-ui-internals/packages/react-components';

// Load actual exports from key files
function getExports(filePath) {
  if (!fs.existsSync(filePath)) return new Set();
  const content = fs.readFileSync(filePath, 'utf8');
  const exports = new Set();
  // Match: export const/function/class NAME
  const directMatch = content.match(/export\s+(?:const|function|class|let)\s+(\w+)/g) || [];
  directMatch.forEach(function(m) {
    const n = m.replace(/export\s+(?:const|function|class|let)\s+/, '');
    exports.add(n);
  });
  // Match: export { NAME, NAME2, ... }
  const blockMatch = content.match(/export\s*\{([^}]+)\}/g) || [];
  blockMatch.forEach(function(block) {
    const names = block.replace(/export\s*\{/, '').replace(/\}/, '').split(',');
    names.forEach(function(n) {
      const trimmed = n.trim().split(/\s+as\s+/)[0].trim();
      if (trimmed) exports.add(trimmed);
    });
  });
  return exports;
}

// The patterns we know are broken - collected from all Vite error logs
// Format: [moduleName, filePath, brokenExportName]
const knownBroken = [
  // ADS
  ['ads/src/components/LocationSearch.js', '@mseva/digit-ui-react-components', 'typeOf'],
  // ASSET
  ['asset/src/pageComponents/ServiceDoc.js', '../utils', 'cardBodyStyle'],
  // ChallanGeneration - multiple pageComponents
  ['challanGeneration/src/pageComponents/AddressDetails.js', '../utils', 'getUniqueItemsFromArray'],
  ['challanGeneration/src/pageComponents/AddressDetails.js', '../utils', 'commonTransform'],
  ['challanGeneration/src/pageComponents/AddressDetails.js', '../utils', 'getPattern'],
  ['challanGeneration/src/pageComponents/ConsumerDetails.js', '../utils', 'getUniqueItemsFromArray'],
  ['challanGeneration/src/pageComponents/ConsumerDetails.js', '../utils', 'commonTransform'],
  ['challanGeneration/src/pageComponents/ConsumerDetails.js', '../utils', 'getPattern'],
  ['challanGeneration/src/pageComponents/ServiceDetails.js', '../utils', 'getUniqueItemsFromArray'],
  ['challanGeneration/src/pageComponents/ServiceDetails.js', '../utils', 'commonTransform'],
  ['challanGeneration/src/pageComponents/ServiceDetails.js', '../utils', 'getPattern'],
  // CommonPT
  ['commonPt/src/pages/components/PropertyAssemblyDetails.js', '../utils', 'cardBodyStyle'],
  // Core
  ['core/src/components/ChangeLanguage.js', '@mseva/digit-ui-react-components', 'Button'],
  // Engagement
  ['engagement/src/components/Modal/Confirmation.js', '@mseva/digit-ui-react-components', 'Text'],
  ['engagement/src/components/Surveys/SurveyForms/SurveyCreationPage.js', 
   '../../../redux/actions/surveyFormActions', 'updateWeightage'],
  // HRMS
  ['hrms/src/pages/HRMSEmployeewiseReport.js', '@mseva/digit-ui-react-components', 'Button'],
  // mCollect
  ['mCollect/src/pageComponents/AddressDetails.js', '../utils', 'getUniqueItemsFromArray'],
  ['mCollect/src/pageComponents/AddressDetails.js', '../utils', 'commonTransform'],
  ['mCollect/src/pageComponents/AddressDetails.js', '../utils', 'getPattern'],
];

function removeNamedImport(filePath, name) {
  if (!fs.existsSync(filePath)) {
    console.log('NOT FOUND: ' + filePath);
    return;
  }
  let content = fs.readFileSync(filePath, 'utf8');
  const before = content;
  
  // Try removing from: "import { A, NAME, B }" -> "import { A, B }"
  // Pattern 1: name followed by comma+space
  content = content.replace(new RegExp('\\b' + name + ',\\s*', 'g'), '');
  // Pattern 2: name preceded by comma+space
  content = content.replace(new RegExp(',\\s*' + name + '\\b', 'g'), '');
  // Pattern 3: name alone on its own line (indented)
  content = content.replace(new RegExp('\\s{2,}' + name + ',?\\r?\\n', 'g'), '\n');
  
  if (content !== before) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Fixed "' + name + '" in ' + filePath.split('/').slice(-1)[0]);
  } else {
    console.log('No match for "' + name + '" in ' + filePath.split('/').slice(-1)[0]);
  }
}

knownBroken.forEach(function(b) {
  const fullPath = base + '/' + b[0];
  removeNamedImport(fullPath, b[2]);
});

console.log('\nBatch fix complete!');
