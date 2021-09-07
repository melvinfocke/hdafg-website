const express = require('express');
const router = express.Router();
const Event = require('../../models/event');

// LOAD CONFIG
const { ALL_CITIES } = require('../../config');

router.get('/', async (req, res) => {
    let eventArray = await Event.find();
    let nextEventArray = [];
    let allCitiesArray = ALL_CITIES.split('{|,|}');
    allCitiesArray?.forEach((cityStr) => {
        let city = cityStr.split('{|:|}')[0];
        let cityDescription = cityStr.split('{|:|}')[1];
        let filteredEventArray = eventArray.filter((event) => event?.city === city && event?.isVisible == true);
        filteredEventArray?.sort((a, b) => {
            if (a.date > b.date) return 1;
            if (a.date < b.date) return -1;
            return 0;
        });
        let event = filteredEventArray[0] || {};
        event.city = city;
        event.cityDescription = cityDescription;
        nextEventArray.push(event);
    });
    res.render('list-all-cities', { internalCss: getInternalCss(nextEventArray), nextEventArray });
});

function getInternalCss(nextEventArray) {
    let internalCss = '<style>';

    nextEventArray.forEach((event) => {
        let cityLowerCase = event.city.toLowerCase();
        internalCss += `
.no-webp #${cityLowerCase}-photo-1 {
    background-image: url('/${cityLowerCase}-512-288.png');
    background-image: -webkit-image-set(
        url('/${cityLowerCase}-256-144.png') 1x,
        url('/${cityLowerCase}-512-288.png') 2x
    );
    background-image: image-set('/${cityLowerCase}-256-144.png' 1x, '/${cityLowerCase}-512-288.png' 2x);
}
.webp #${cityLowerCase}-photo-1 {
    background-image: url('/${cityLowerCase}-512-288.webp');
    background-image: -webkit-image-set(
        url('/${cityLowerCase}-256-144.webp') 1x,
        url('/${cityLowerCase}-512-288.webp') 2x
    );
    background-image: image-set('/${cityLowerCase}-256-144.webp' 1x, '/${cityLowerCase}-512-288.webp' 2x);
}
@media only screen and (min-width: 563px) {
    .no-webp #${cityLowerCase}-photo-2 {
        background-image: url('/${cityLowerCase}-512-288.png');
        background-image: -webkit-image-set(
            url('/${cityLowerCase}-400-525.png') 1x,
            url('/${cityLowerCase}-800-1050.png') 2x
        );
        background-image: image-set('/${cityLowerCase}-400-525.png' 1x, '/${cityLowerCase}-800-1050.png' 2x);
    }
    .webp #${cityLowerCase}-photo-2 {
        background-image: url('/${cityLowerCase}-512-288.webp');
        background-image: -webkit-image-set(
            url('/${cityLowerCase}-400-525.webp') 1x,
            url('/${cityLowerCase}-800-1050.webp') 2x
        );
        background-image: image-set('/${cityLowerCase}-400-525.webp' 1x, '/${cityLowerCase}-800-1050.webp' 2x);
    }
}`;
    });

    internalCss += internalCss === '<style>' ? '.events-container { display: none; }' : '';
    internalCss += '</style>';

    return internalCss;
}

module.exports = router;
