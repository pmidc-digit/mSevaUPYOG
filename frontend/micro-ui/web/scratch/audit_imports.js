const fs = require('fs');
const path = require('path');

function scanDir(dir, results) {
  results = results || [];
  var files;
  try { files = fs.readdirSync(dir); } catch(e) { return results; }
  for (var i = 0; i < files.length; i++) {
    var f = files[i];
    var fullPath = path.join(dir, f);
    try {
      var stat = fs.statSync(fullPath);
      if (stat.isDirectory() && f !== 'node_modules' && f !== '.git') {
        scanDir(fullPath, results);
      } else if (f.endsWith('.js')) {
        var content = fs.readFileSync(fullPath, 'utf8');
        var lines = content.split('\n');
        for (var li = 0; li < lines.length; li++) {
          var line = lines[li];
          var m = line.match(/^import\s*\{([^}]+)\}\s*from\s*['"]([^'"]+)['"]/);
          if (m && m[2].startsWith('.')) {
            var names = m[1].split(',').map(function(s){ return s.trim(); }).filter(Boolean);
            results.push({ file: fullPath, names: names, from: m[2], lineNum: li+1 });
          }
        }
      }
    } catch(e) {}
  }
  return results;
}

var baseDir = 'micro-ui-internals/packages/modules';
var imports = scanDir(baseDir);
console.log('Total imports scanned: ' + imports.length);

var broken = [];
for (var i = 0; i < imports.length; i++) {
  var imp = imports[i];
  var dir = path.dirname(imp.file);
  var resolved = path.resolve(dir, imp.from);
  if (!resolved.endsWith('.js')) resolved += '.js';
  if (!fs.existsSync(resolved)) continue;
  var src;
  try { src = fs.readFileSync(resolved, 'utf8'); } catch(e) { continue; }
  for (var j = 0; j < imp.names.length; j++) {
    var name = imp.names[j];
    if (!name) continue;
    var patterns = [
      'export const ' + name,
      'export let ' + name,
      'export function ' + name,
      'export class ' + name,
      'export { ' + name + ' ',
      'export { ' + name + ',',
      'export {' + name + ',',
      'export {' + name + ' ',
      ', ' + name + ' }',
      ', ' + name + '}',
    ];
    var found = false;
    for (var k = 0; k < patterns.length; k++) {
      if (src.indexOf(patterns[k]) !== -1) { found = true; break; }
    }
    if (!found) {
      broken.push(imp.file.replace(baseDir + '\\\\', '').replace(baseDir + '/', '') + ':' + imp.lineNum + ' -> ' + name + ' from ' + imp.from);
    }
  }
}

if (broken.length === 0) {
  console.log('NO BROKEN NAMED IMPORTS FOUND');
} else {
  console.log('BROKEN IMPORTS (' + broken.length + '):');
  broken.forEach(function(b){ console.log(b); });
}
