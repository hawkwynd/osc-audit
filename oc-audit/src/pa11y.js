const pa11y = require('pa11y');

let url = 'https://www.omnicommander.com/marketing';

console.log(`Running pa11y on ${url} - Please wait...`);

const options = {
    ignore: [
        'warning',
        'notice'
    ]
}

pa11y( url ).then( ( results ) => {

    // Do something with the results
    //  console.log(results);

    let issues = results.issues;
    let title = results.documentTitle;
    let url = results.pageUrl;
    let counter = 1;
    let rows = issues.length;

    console.log(`Document title: ${title}`);
    console.log(`URL: ${url}`);
    console.log(rows + ' errors found:');

    for(issue of issues){
        console.log(`Item No: ${counter}`);
        console.log(`Selector: ${issue.selector}`);
        console.log(`Message: ${issue.message}`);
        console.log(`Context: ${issue.context}` );
        
        counter++;
        
    }


});
