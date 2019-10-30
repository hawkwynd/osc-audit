const ParseHtml =  (el) => {
    let search = '/assets/';
        el.oldData = el.oldData.replace(new RegExp(search, 'g'), 'https://'+el.rootUrl + '/assets/');
        el.newData = el.newData.replace(new RegExp(search, 'g'), 'https://'+el.rootUrl + '/assets/');
        el.diffData = el.diffData.replace(new RegExp(search, 'g'), 'https://'+el.rootUrl + '/assets/');
        el.oldData = el.oldData.replace(new RegExp('data-src', 'g'), 'src');
        el.newData = el.newData.replace(new RegExp('data-src', 'g'), 'src');
        el.diffData = el.diffData.replace(new RegExp('data-src', 'g'), 'src');
        return el;
};

module.exports =  ParseHtml;