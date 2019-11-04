const pa11y = require('pa11y');

pa11y('https://www.commandercu.com/home',{ ignore:['warning','notice'] }).then((results) => {

    // Do something with the results
    console.log(results);

});