const http = require('http');
const files = [
  'micro-ui-internals/packages/modules/dss/src/components/ArrowUpward.js',
  'micro-ui-internals/packages/modules/dss/src/pages/Home.js',
  'micro-ui-internals/packages/modules/ws/src/components/DownloadBtnColored.js',
];
files.forEach(function(f) {
  http.get('http://localhost:3000/digit-ui/' + f, function(res) {
    let data = '';
    res.on('data', function(c) { data += c; });
    res.on('end', function() {
      const hasRC = data.includes('ReactComponent');
      const svgLineMatch = data.match(/from "([^"]*\.svg[^"]*)"/);
      const svgUrl = svgLineMatch ? svgLineMatch[1] : 'not found';
      console.log(f.split('/').slice(-1)[0] + ' - hasRC: ' + hasRC + ' | SVG URL: ' + svgUrl.substring(0,80));
    });
  });
});
