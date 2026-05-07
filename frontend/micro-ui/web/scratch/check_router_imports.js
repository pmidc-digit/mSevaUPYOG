const fs = require('fs');
const path = require('path');

const validRRDExports = [
  'BrowserRouter','HashRouter','MemoryRouter','Router','StaticRouter',
  'Route','Switch','Redirect','Link','NavLink','Prompt',
  'useHistory','useLocation','useParams','useRouteMatch',
  'withRouter','matchPath','generatePath','useNavigate',
  'Outlet','Routes','Navigate','useNavigationType','useOutlet',
  'useOutletContext','useResolvedPath','useSearchParams',
  'createSearchParams','RouterProvider','createBrowserRouter',
];

function isValid(name) {
  return validRRDExports.indexOf(name) !== -1;
}

function scan(dir, results) {
  results = results || [];
  var files;
  try { files = fs.readdirSync(dir); } catch(e) { return results; }
  for (var i = 0; i < files.length; i++) {
    var f = files[i];
    var full = path.join(dir, f);
    try {
      var stat = fs.statSync(full);
      if (stat.isDirectory() && f !== 'node_modules' && f !== '.git') {
        scan(full, results);
      } else if (f.endsWith('.js') || f.endsWith('.jsx')) {
        var content = fs.readFileSync(full, 'utf8');
        if (content.indexOf('react-router-dom') === -1) continue;
        var lines = content.split('\n');
        for (var li = 0; li < lines.length; li++) {
          var l = lines[li];
          if (l.indexOf('react-router-dom') === -1) continue;
          var m = l.match(/import\s*\{([^}]+)\}\s*from\s*['"]react-router-dom['"]/);
          if (!m) continue;
          var names = m[1].split(',').map(function(s) {
            return s.trim().split(' as ')[0].trim();
          }).filter(Boolean);
          var invalid = names.filter(function(n) { return !isValid(n); });
          if (invalid.length > 0) {
            results.push({
              file: full.replace('micro-ui-internals\\packages\\', '').replace('micro-ui-internals/packages/', ''),
              line: li + 1,
              invalid: invalid
            });
          }
        }
      }
    } catch(e) {}
  }
  return results;
}

var hits = scan('micro-ui-internals/packages/modules');
if (hits.length === 0) {
  console.log('No invalid react-router-dom imports found!');
} else {
  hits.forEach(function(h) {
    console.log(h.file + ':' + h.line + ' | Invalid: ' + h.invalid.join(', '));
  });
}
console.log('Total issues:', hits.length);
