/* Socket.io */
const mainProcessBar = document.getElementById('main-process-bar');
const mainPercentage = document.getElementById('main-percentage');
const mainBar = document.getElementById('main-bar');
const mainHeadline = document.getElementById('main-headline');
const mainP = document.getElementById('main-p');
const mainButtonSection = document.getElementById('main-button-section');
const previewContent = document.getElementById('preview-content');

const socket = io(window.location.href);
socket.on('connection');

function selectInNav(options) {
    socket.emit('selectInNav', options);
}

function replaceContent(sourceId, destinationId, convertOption) {
    const source = document.getElementById(sourceId);
    const destination = document.getElementById(destinationId);

    if (!destination || !source) return;

    switch (convertOption) {
        case 'fullDateString':
            destination.innerHTML = source.value + (source.value.split(' ')[1] ? ' Uhr' : '');
            break;
        default:
            destination.innerHTML = source.value;
    }
}

function setup(options) {
    let inputContainer = document.getElementById('input-container');
    let children = inputContainer?.children;
    let inputDataArray = [];

    if (children) {
        let index = 1;
        let inputRadioIndex = 0;
        Array.from(children).forEach((child) => {
            if (index % 2 == 0) {
                if (child.className == 'input-radio') {
                    let inputRadioDiv = document.getElementsByClassName('input-radio')[inputRadioIndex];
                    let radioChildren = inputRadioDiv.children;

                    let id = '';
                    let value = '';
                    Array.from(radioChildren).forEach((radioChild) => {
                        id = radioChild.id;
                        if (radioChild.checked) value = radioChild.value;
                    });
                    inputDataArray.push({ id, value });
                    inputRadioIndex++;
                } else {
                    inputDataArray.push({ id: child.id, value: child.value });
                }
            }
            index++;
        });
    }

    options.inputs = inputDataArray;

    socket.emit('setup', options);
}

socket.on('sendPageContent', (data) => {
    let mainPercentageString = data.mainPercentage;
    if (mainPercentageString == '-1%' || mainPercentageString == undefined) {
        mainProcessBar.style.visibility = 'hidden';
        mainPercentage.innerHTML = '0%';
        mainBar.style.width = '0%';
    } else {
        mainProcessBar.style.visibility = 'visible';
        mainPercentage.innerHTML = mainPercentageString;
        mainBar.style.width = mainPercentageString;
    }

    mainHeadline.innerHTML = data.mainHeadline;
    mainP.innerHTML = data.mainP;
    mainButtonSection.innerHTML = data.mainButtonSection;
    previewContent.innerHTML = data.previewContent;
});

socket.on('sendError', (data) => {
    window.alert(data.message);
});
