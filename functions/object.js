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

module.exports = { convertStringToObject };
