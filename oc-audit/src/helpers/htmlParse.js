const htmlParse =  function(input) {
    let search = '/assets/';
	return  input.map(el => {
        el.oldData = el.oldData.replace(new RegExp(search, 'g'), 'https://'+el.rootUrl + '/assets/');
        el.newData = el.newData.replace(new RegExp(search, 'g'), 'https://'+el.rootUrl + '/assets/');
        el.oldData = el.oldData.replace(new RegExp('data-src', 'g'), 'src');
        el.newData = el.newData.replace(new RegExp('data-src', 'g'), 'src');
        return el;
    });
}

module.exports =  htmlParse;