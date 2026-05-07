const fs = require('fs');

function removeFromImport(filePath, namesToRemove) {
  if (!fs.existsSync(filePath)) {
    console.log('FILE NOT FOUND: ' + filePath);
    return;
  }
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  namesToRemove.forEach(function(name) {
    // Try different patterns
    const patterns = [
      name + ', ',
      ', ' + name,
      '  ' + name + ',\n',
      '  ' + name + ',\r\n',
    ];
    patterns.forEach(function(p) {
      if (content.includes(p)) {
        content = content.replace(p, '');
        changed = true;
      }
    });
  });
  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Fixed: ' + filePath.split('/').slice(-1)[0]);
  } else {
    console.log('No match found in: ' + filePath.split('/').slice(-1)[0]);
  }
}

function removeLineFromFile(filePath, lineContent) {
  if (!fs.existsSync(filePath)) {
    console.log('FILE NOT FOUND: ' + filePath);
    return;
  }
  let content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const filtered = lines.filter(function(l) { return !l.includes(lineContent); });
  if (filtered.length !== lines.length) {
    fs.writeFileSync(filePath, filtered.join('\n'), 'utf8');
    console.log('Removed line containing "' + lineContent + '" from ' + filePath.split('/').slice(-1)[0]);
  } else {
    console.log('Line not found: "' + lineContent + '" in ' + filePath.split('/').slice(-1)[0]);
  }
}

const base = 'micro-ui-internals/packages/modules';

// mCollect - remove commonTransform (doesn't exist in mCollect utils)
removeFromImport(base + '/mCollect/src/pageComponents/ConsumerDetails.js', ['commonTransform']);
removeFromImport(base + '/mCollect/src/pageComponents/ServiceDetails.js', ['commonTransform']);

// NDC - remove TLTimeLine and StarRated
removeFromImport(base + '/ndc/src/pages/citizen/ApplicationOverview/index.js', ['TLTimeLine', 'StarRated']);

// Templates - remove config exports
removeFromImport(base + '/templates/ApplicationDetails/Modal/PTActionModal.js', 
  ['configPTRejectApplication', 'configPTVerifyApplication', 'configPTApproverApplication']);

console.log('\nDone!');
