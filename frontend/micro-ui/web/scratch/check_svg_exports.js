const http = require('http');
const svgFiles = [
  'micro-ui-internals/packages/modules/dss/src/images/Arrow_Downward.svg?import',
  'micro-ui-internals/packages/modules/dss/src/images/Arrow_Upward.svg?import',
  'micro-ui-internals/packages/modules/dss/src/images/Arrow_Right.svg?import',
  'micro-ui-internals/packages/modules/dss/src/images/Arrow_Right_white.svg?import',
  'micro-ui-internals/packages/modules/ws/src/utils/images/DownloadBtnCol.svg?import',
  'micro-ui-internals/packages/modules/dss/src/images/property-tax.svg?import',
];
let done = 0;
svgFiles.forEach(function(f) {
  http.get('http://localhost:3000/digit-ui/' + f, function(res) {
    let data = '';
    res.on('data', function(c) { data += c; });
    res.on('end', function() {
      const ok = data.includes('ReactComponent');
      const name = f.split('/').slice(-1)[0];
      console.log((ok ? 'OK  ' : 'FAIL') + ' [' + res.statusCode + '] ' + name);
      if (++done === svgFiles.length) console.log('\nAll done!');
    });
  }).on('error', function(e) {
    console.log('ERROR ' + f + ': ' + e.message);
    if (++done === svgFiles.length) console.log('\nAll done!');
  });
});
