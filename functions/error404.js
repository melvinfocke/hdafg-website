const { MODE, CITY, DOMAIN } = require('../config');

function send404Page(res) {
    const cityLowerCase = MODE === 'NODE' ? CITY.toLowerCase() : '';
    res.status(404).render('error', {
        city: MODE === 'NODE' ? CITY : undefined,
        status: 404,
        time: -1,
        url: undefined,
        message: `Ge&shy;he zu&shy;rück zu <a href="/${cityLowerCase}">${DOMAIN}${
            cityLowerCase === '' ? '' : '/'
        }${cityLowerCase}</a>`
    });
}

module.exports = { send404Page };
