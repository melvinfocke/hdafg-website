function convertStringToObject(str) {
    str = str || '';
    let object = {};
    let pairs = str.split('{|,|}');

    pairs.forEach((pair) => {
        let key = pair.split('{|:|}')[0];
        let value = pair.split('{|:|}')[1];
        object[key] = value;
    });

    return object;
}

function combineStringObjectArray(stringArray) {
    let returnObject = {};
    stringArray?.forEach((str) => {
        let object = convertStringToObject(str);

        Object.keys(object).forEach((key) => {
            returnObject[key] = object[key];
        });
    });
    return returnObject;
}

module.exports = { convertStringToObject, combineStringObjectArray };
