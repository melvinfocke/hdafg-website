let modal = document.getElementById('novalja-nightbeat');
let btn = document.getElementById('novalja-nightbeat-btn');
let span = document.getElementById('novalja-nightbeat-close');

btn.onclick = function () {
    let link = document.createElement('link');
    link.href = 'style-bg-blur.css';
    link.type = 'text/css';
    link.rel = 'stylesheet';
    document.getElementsByTagName('head')[0].appendChild(link);

    modal.style.display = 'block';
};
span.onclick = function () {
    let link = document.getElementsByTagName('link')[2];
    link.parentNode.removeChild(link);

    modal.style.display = 'none';
};
window.onclick = function (event) {
    if (event.target == modal) {
        let link = document.getElementsByTagName('link')[2];
        link.parentNode.removeChild(link);

        modal.style.display = 'none';
    }
};
