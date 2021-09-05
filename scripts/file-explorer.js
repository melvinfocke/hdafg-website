const url = `/admin/file-explorer`;

function deletebutton(id) {
    const confirmString = window.prompt(`Gib 'BESTÄTIGEN' ein, um die Datei ${id} zu löschen.`, '');
    if (confirmString && confirmString.localeCompare('BESTÄTIGEN') == 0) return deleteEntry(id);
    else window.alert('Löschen wurde abgebrochen.');
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
