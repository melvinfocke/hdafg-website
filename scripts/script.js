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

let isModalVisible = false;
function showModal(id, displayName, date, time) {
    let modalSpanTime = document.getElementById('modal-span-time');
    let modalSpanDisplayName = document.getElementById('modal-span-displayname');
    let modalSpanDate = document.getElementById('modal-span-date');

    let style = document.createElement('style');
    style.id = 'style-modal-open';
    style.innerText = `
    :root {
        --nav-bar: rgba(252, 33, 119, 0.9);
    }
    
    hr,
    h1,
    h2:not(.modal *),
    h3,
    h4,
    p:not(.modal *),
    img:not(.logo-big, .modal *),
    .event-div,
    .welcome-img,
    footer {
        filter: blur(6px);
    }
    
    header {
        background-color: transparent;
    }
    
    nav {
        display: none;
    }
    
    @media only screen and (min-height: 585px) and (min-width: 563px) {
        header {
            background-color: var(--nav-bar);
        }
    
        nav {
            display: flex;
        }
    }
    
    `;
    if (isModalVisible == false) {
        isModalVisible = true;
        document.getElementsByTagName('head')[0].appendChild(style);
    }
    modalH1DisplayName.innerHTML = displayName;
    modalSpanDisplayName.innerHTML = displayName;
    modalContentImg.id = `${id}-photo-2`;
    modalSpanDate.innerHTML = date;
    modalSpanTime.innerHTML = time != '' ? ` um <strong>${time} Uhr</strong>` : '';
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

    sendForm({
        givenName: givenName.value,
        surName: surName.value,
        phone: phone.value,
        eventId: eventId.value,
        remarks: remarks.value
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
    isModalVisible = false;
    let style = document.getElementById('style-modal-open');
    style.parentNode.removeChild(style);

    form.style = '';
    formContainerLeft.style.display = 'block';
    formContainerRight.style.display = 'block';
    textContainerLeft.style.display = 'none';
    textContainerRight.style.display = 'none';
    submitBtn.innerHTML = 'Anmeldung senden';
    modalP.innerHTML = `
    <strong><span id="modal-span-displayname"></span></strong> fin&shy;det am
    <strong><span id="modal-span-date"></span></strong
    ><span id="modal-span-time"></span> statt. Bei An&shy;mel&shy;dung mit dem For&shy;mu&shy;lar er&shy;hälst du
    in&shy;ner&shy;halb von 24 Stun&shy;den ei&shy;ne Em&shy;pfangs&shy;be&shy;stä&shy;ti&shy;gung. Die An&shy;mel&shy;dung ist aber
    <strong>nicht</strong> die Zu&shy;sa&shy;ge zum Event kom&shy;men zu dür&shy;fen. Die Zu&shy;stim&shy;mung ob&shy;liegt dem
    Ver&shy;an&shy;stal&shy;ter und wird per WhatsApp er&shy;teilt.`;
    modal.style.display = 'none';
    modalP.style.height = '';
}

function truncate(str, n) {
    return str?.length > n ? str?.substr(0, n - 1) : str;
}

function sendForm(obj) {
    let json = JSON.stringify(obj);
    let xmlHttp = new XMLHttpRequest();
    xmlHttp.open('POST', `${window.location.href}`, true);
    xmlHttp.setRequestHeader('Content-type', 'application/json; charset=utf-8');
    xmlHttp.onload = () => {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
            const responseObj = JSON.parse(xmlHttp.responseText);

            span.scrollIntoView();

            modalH1DisplayName.innerHTML = `ANMELDUNG ${responseObj.status}`;
            formContainerLeft.style.display = 'none';
            formContainerRight.style.display = 'none';
            textContainerLeft.style.display = 'block';
            textContainerRight.style.display = 'block';
            givenName.value = '';
            surName.value = '';
            phone.value = '';
            eventId.value = '';
            remarks.value = '';
            modalP.innerHTML = responseObj.message;
            modalP.style.height = 'auto';
        }
    };
    xmlHttp.send(json);
}
