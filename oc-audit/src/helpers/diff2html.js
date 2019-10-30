let Diff2Html = require("diff2html").Diff2Html;
let difflib = require('difflib');

module.exports = (audit) => {
    let unifiedDiff = difflib
      .unifiedDiff(audit.oldData.match(/<([a-z][a-z0-9]*)\b[^>]*>(.*?)<\/\1>/g), audit.newData.match(/<([a-z][a-z0-9]*)\b[^>]*>(.*?)<\/\1>/g), {
    fromfile: "Previews Version",
    tofile: "Current Version",
    fromfileDate: audit.oldData,
    tofileDate:  audit.newData,
    n: '2'
  });
  unifiedDiff = unifiedDiff.map((line, index) => {
      /* 
              Checks if next line has change and dosen't already  have a new line, then adss newline character
              helps parse the data
          */
      if(unifiedDiff[index+1] && (unifiedDiff[index+1].charAt(0) === "+" || unifiedDiff[index+1].charAt(0) === "-") && !line.includes('\n')) {
        return line + '\n';
      } 
      return line;
  });

  return Diff2Html.getPrettyHtml(
    unifiedDiff.join(''),
    {inputFormat: 'diff', showFiles: true, matching: 'lines', outputFormat: 'line-by-line', maxLineLengthHighlight: 20000}
  );


};