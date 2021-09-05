const url = `/admin/registrations`;

function deletebutton(id) {
    const confirmString = window.prompt(`Gib 'BESTÄTIGEN' ein, um den Eintrag ${id} zu löschen.`, '');
    if (confirmString && confirmString.localeCompare('BESTÄTIGEN') == 0) return deleteEntry(id);
    else window.alert('Löschen wurde abgebrochen.');
}
let buttonState = 'E';
function editbutton(id) {
    if (buttonState.localeCompare('E') == 0) {
        buttonState = 'A';
        const children = document.getElementById(id).children;
        let index = 1;
        Array.from(children).forEach((li) => {
            if (index % 2 == 1 && index >= 3 && index <= 15) {
                li.setAttribute('contenteditable', 'true');
                li.classList.add('editable');
                li.addEventListener('paste', function (event) {
                    event.preventDefault();
                    document.execCommand('inserttext', false, event.clipboardData.getData('text/plain'));
                });
            }
            index++;
            if (li.classList.contains('editButton')) {
                li.classList.add('editButtonApply');
                li.innerHTML = '<span>A</span>';
            }
        });
    } else {
        buttonState = 'E';
        const children = document.getElementById(id).children;
        let index = 1;
        let contentArr = [];
        Array.from(children).forEach((li) => {
            if (index % 2 == 1 && index >= 3 && index <= 15) {
                li.setAttribute('contenteditable', 'false');
                li.classList.remove('editable');
                contentArr = [...contentArr, li.innerHTML.replace('<span>', '').replace('</span>', '')];
            }
            index++;
            if (li.classList.contains('editButton')) {
                li.classList.remove('editButtonApply');
                li.innerHTML = '<span>E</span>';
            }
        });
        let data = {};
        contentArr.forEach((item, index) => {
            switch (index) {
                case 0:
                    data.givenName = item;
                    break;
                case 1:
                    data.surName = item;
                    break;
                case 2:
                    data.phone = item;
                    break;
                case 3:
                    data.remarks = item;
                    break;
                case 4:
                    data.event = item;
                    break;
                case 5:
                    data.city = item;
                    break;
                case 6:
                    data.dateAsString = item;
                    break;
            }
        });
        let json = JSON.stringify(data);
        let xmlHttp = new XMLHttpRequest();
        xmlHttp.open('PATCH', `${url}/${id}`, true);
        xmlHttp.setRequestHeader('Content-type', 'application/json; charset=utf-8');
        xmlHttp.onload = () => {
            if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
                window.location.reload();
            }
        };
        xmlHttp.send(json);
    }
}

function addbutton(value = 'ADD') {
    if (value.localeCompare('X') == 0) {
        let newRow = document.getElementById('newRow');
        newRow.style = 'display: none;';
        const children = newRow.children;
        let index = 1;
        Array.from(children).forEach((li) => {
            if (index % 2 == 1 && index >= 3 && index <= 15) {
                li.innerHTML = '<span></span>';
            }
            index++;
        });
    }
    if (value.localeCompare('ADD') == 0) {
        let newRow = document.getElementById('newRow');
        newRow.style = 'display: flex;';
    } else if (value.localeCompare('A') == 0) {
        const children = document.getElementById('newRow').children;
        let index = 1;
        let contentArr = [];
        Array.from(children).forEach((li) => {
            if (index % 2 == 1 && index >= 3 && index <= 15) {
                contentArr = [...contentArr, li.innerHTML.replace('<span>', '').replace('</span>', '')];
            }
            index++;
        });
        let data = {};
        contentArr.forEach((item, index) => {
            switch (index) {
                case 0:
                    data.givenName = item;
                    break;
                case 1:
                    data.surName = item;
                    break;
                case 2:
                    data.phone = item;
                    break;
                case 3:
                    data.remarks = item;
                    break;
                case 4:
                    data.event = item;
                    break;
                case 5:
                    data.city = item;
                    break;
                case 6:
                    data.dateAsString = item;
                    break;
            }
        });
        let json = JSON.stringify(data);
        let xmlHttp = new XMLHttpRequest();
        xmlHttp.open('POST', `${url}`, true);
        xmlHttp.setRequestHeader('Content-type', 'application/json; charset=utf-8');
        xmlHttp.onload = () => {
            if (xmlHttp.readyState == 4 && xmlHttp.status == 201) {
                window.location.reload();
            }
        };
        xmlHttp.send(json);
    }
}

function deleteEntry(id) {
    let xmlHttp = new XMLHttpRequest();
    xmlHttp.open('DELETE', `${url}/${id}`, true);
    xmlHttp.onload = () => {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
            window.location.reload();
        }
    };
    xmlHttp.send(null);
}

document.querySelectorAll('[contenteditable]').forEach((item) =>
    item.addEventListener('paste', function (event) {
        event.preventDefault();
        document.execCommand('inserttext', false, event.clipboardData.getData('text/plain'));
    })
);
