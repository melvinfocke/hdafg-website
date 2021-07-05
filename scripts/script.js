let modal = document.getElementById('modal');
let span = document.getElementById('modal-close');
let alert = document.getElementById('alert');
let modalContentImg = document.getElementById('modal-content-img');
let modalH1DisplayName = document.getElementById('modal-h1-displayname');
let modalP = document.getElementById('modal-p');
let eventid = document.getElementById('eventid');
let submitBtn = document.getElementById('submit');
let closeBtn = document.getElementById('close-btn');
let form = document.getElementById('form');
let formContainerLeft = document.getElementById('form-container-left');
let formContainerRight = document.getElementById('form-container-right');
let textContainerLeft = document.getElementById('text-container-left');
let textContainerRight = document.getElementById('text-container-right');

const givenName = document.getElementById('givenname');
const surName = document.getElementById('surname');
const phone = document.getElementById('phone');
const eventId = document.getElementById('eventid');
const remarks = document.getElementById('remarks');

/* Socket.io */
const socket = io(window.location.origin);
socket.on('connection');

function showModal(id, displayName, date, time) {
    let modalSpanTime = document.getElementById('modal-span-time');
    let modalSpanDisplayName = document.getElementById('modal-span-displayname');
    let modalSpanDate = document.getElementById('modal-span-date');

    let link = document.createElement('link');
    link.href = 'style-modal-open.css';
    link.type = 'text/css';
    link.rel = 'stylesheet';
    document.getElementsByTagName('head')[0].appendChild(link);

    modalH1DisplayName.innerHTML = displayName;
    modalSpanDisplayName.innerHTML = displayName;
    modalContentImg.id = `${id}-photo-2`;
    modalSpanDate.innerHTML = date;
    modalSpanTime.innerHTML = time != 'undefined' ? ` um <strong>${time} Uhr</strong>` : '';
    eventid.value = id;
    modal.style.display = 'block';
}

alert.onclick = function () {
    window.location.replace('/');
};

givenName.oninput = function () {
    givenName.style.backgroundColor = 'transparent';
};

surName.oninput = function () {
    surName.style.backgroundColor = 'transparent';
};

phone.oninput = function () {
    phone.style.backgroundColor = 'transparent';
};

submitBtn.onclick = function () {
    givenNameValue = givenName.value;
    surNameValue = surName.value;
    phoneValue = phone.value;
    eventIdValue = eventId.value;
    remarksValue = remarks.value;

    givenNameValue = truncate(givenNameValue, 26);
    surNameValue = truncate(surNameValue, 26);
    phoneValue = truncate(phoneValue, 24);
    remarksValue = truncate(remarksValue, 200);
    eventIdValue = truncate(eventIdValue, 50);

    givenNameValue = givenNameValue?.replace(/\s/g, '') !== '' ? givenNameValue : null;
    surNameValue = surNameValue?.replace(/\s/g, '') !== '' ? surNameValue : null;
    phoneValue = phoneValue?.replace(/\s/g, '') !== '' ? phoneValue : null;
    remarksValue = remarksValue?.replace(/\s/g, '') !== '' ? remarksValue : null;

    let givenNameBgClr = 'transparent';
    let surNameBgClr = 'transparent';
    let phoneBgClr = 'transparent';

    if (givenNameValue == null) givenNameBgClr = 'rgba(252, 33, 119, 0.2)';
    if (surNameValue == null) surNameBgClr = 'rgba(252, 33, 119, 0.2)';
    if (phoneValue == null) phoneBgClr = 'rgba(252, 33, 119, 0.2)';

    givenName.style.backgroundColor = givenNameBgClr;
    surName.style.backgroundColor = surNameBgClr;
    phone.style.backgroundColor = phoneBgClr;

    if (!(givenNameValue && surNameValue && phoneValue)) return;

    submitBtn.innerHTML = 'Bitte warten...';

    socket.emit('sendForm', {
        givenName: givenName.value,
        surName: surName.value,
        phone: phone.value,
        eventId: eventId.value,
        remarks: remarks.value
    });

    socket.on('sendFormResult', (data) => {
        span.scrollIntoView();

        modalH1DisplayName.innerHTML = `ANMELDUNG ${data.status.toUpperCase()}`;
        formContainerLeft.style.display = 'none';
        formContainerRight.style.display = 'none';
        textContainerLeft.style.display = 'block';
        textContainerRight.style.display = 'block';
        givenName.value = '';
        surName.value = '';
        phone.value = '';
        eventId.value = '';
        remarks.value = '';
        modalP.innerHTML = data.message;
        modalP.style.height = 'auto';
    });
};

span.onclick = function () {
    closeModal();
};

closeBtn.onclick = function () {
    closeModal();
};

window.onclick = function (event) {
    if (event.target == modal) {
        closeModal();
    }
};

function closeModal() {
    let link = document.getElementsByTagName('link')[18];
    link.parentNode.removeChild(link);

    form.style = '';
    formContainerLeft.style.display = 'block';
    formContainerRight.style.display = 'block';
    textContainerLeft.style.display = 'none';
    textContainerRight.style.display = 'none';
    submitBtn.innerHTML = 'Anmeldung senden';
    modalP.innerHTML = `
    <strong><span id="modal-span-displayname"></span></strong> findet am
    <strong><span id="modal-span-date"></span></strong
    ><span id="modal-span-time"></span> statt. Bei Anmeldung mit dem Formular erhälst du
    innerhalb von 24 Stunden eine Empfangsbestätigung. Die Anmeldung ist aber
    <strong>nicht</strong> die Zusage zum Event kommen zu dürfen. Die Zustimmung obliegt dem
    Veranstalter und wird per WhatsApp erteilt.`;
    modal.style.display = 'none';
    modalP.style.height = '';
}

function truncate(str, n) {
    return str?.length > n ? str?.substr(0, n - 1) : str;
}
