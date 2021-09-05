function autoRedirect(res, object) {
    const { time, responseCode, message, url } = object;
    let timeString = time ? `t=${time}&` : '';
    let responseCodeString = responseCode ? `r=${responseCode}&` : '';
    let messageString = message ? `m=${message}&` : '';
    let urlString = url ? `url=${url}&` : '';

    res.redirect(('/redirect?' + timeString + responseCodeString + messageString + urlString).slice(0, -1));
}

module.exports = { autoRedirect };
