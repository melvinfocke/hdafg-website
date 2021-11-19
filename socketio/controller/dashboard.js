const { combineStringObjectArray } = require('../../functions/controller/object');
const { ALL_CITIES, ROOT_DIRECTORY, UPLOAD_DIRECTORY } = require('../../config');
const Admin = require('../../models/admin');
const Event = require('../../models/event');
const Setup = require('../../models/setup');
const { deleteFile } = require('../../functions/controller/uploader');

module.exports = function (io, sessionMiddleware, passport) {
    const wrap = (middleware) => (socket, next) => middleware(socket.request, {}, next);

    io.use(wrap(sessionMiddleware));
    io.use(wrap(passport.initialize()));
    io.use(wrap(passport.session()));

    io.of('/admin/dashboard').use((socket, next) => {
        const referer = socket.handshake.headers.referer;
        const pathName = '/' + referer.split('/').slice(3).join('/');

        if (pathName === '/admin/dashboard') sessionMiddleware(socket.request, {}, next);
    });

    io.of('/admin/dashboard').on('connection', async (socket) => {
        let userId = socket.request.session.passport?.user;

        const admin = await Admin.findById(userId);
        if (!admin) return;

        socket.on('selectInNav', async (data) => {
            socket.emit('sendPageContent', await getPageContent(data));
        });
        socket.on('getPreviewContent', async (data) => {
            socket.emit('sendPageContent', await getPreviewContent(data, socket));
        });
        socket.on('setup', async (data) => {
            data.userId = admin?._id;
            data.socket = socket;
            await sendSetupContent(data);
        });
        socket.on('transcodeUploadedFile', async (data) => {
            data.socket = socket;
            await transcodeUploadedFile(data);
        });
    });
};

async function transcodeUploadedFile(data) {
    const tempArray0 = data?.fileName?.split(/\.(?=[^\.]+$)/);
    const tempArray1 = tempArray0[0]?.split(/\.(?=[^\.]+$)/);

    const fileName = tempArray1[0];
    const origString = tempArray1[1];
    const fileExtention = tempArray0[1];

    switch (`.${origString}.${fileExtention}`) {
        case '.orig.png':
        case '.orig.jpg':
        case '.orig.jpeg':
            break;
        default:
            socket.emit('sendError', { message: 'Die Datei muss vom Typ .png, .jpg oder .jpeg sein.' });
            deleteFile(`${ROOT_DIRECTORY}/${UPLOAD_DIRECTORY}/${data.fileName}`);
            return;
    }

    const tempArray2 = fileName.split(/\-(?=[^\-]+$)/);
    const tempArray3 = tempArray2[0].split(/\-(?=[^\-]+$)/);

    const height = parseInt(tempArray2[1]);
    const width = parseInt(tempArray3[1]);
    const eventId = tempArray3[0];

    let sharp = require('sharp');
    sharp.cache(false);

    try {
        sharp(`${ROOT_DIRECTORY}/${UPLOAD_DIRECTORY}/${data.fileName}`)
            .resize(width * 2, height * 2)
            .toFile(`${ROOT_DIRECTORY}/${UPLOAD_DIRECTORY}/${eventId}-${width * 2}-${height * 2}.webp`)
            .then((data1) => {
                sharp(`${ROOT_DIRECTORY}/${UPLOAD_DIRECTORY}/${data.fileName}`)
                    .resize(width, height)
                    .toFile(`${ROOT_DIRECTORY}/${UPLOAD_DIRECTORY}/${eventId}-${width}-${height}.webp`)
                    .then((data2) => {
                        sharp(`${ROOT_DIRECTORY}/${UPLOAD_DIRECTORY}/${data.fileName}`)
                            .resize(width * 2, height * 2)
                            .toFile(`${ROOT_DIRECTORY}/${UPLOAD_DIRECTORY}/${eventId}-${width * 2}-${height * 2}.png`)
                            .then((data3) => {
                                sharp(`${ROOT_DIRECTORY}/${UPLOAD_DIRECTORY}/${data.fileName}`)
                                    .resize(width, height)
                                    .toFile(`${ROOT_DIRECTORY}/${UPLOAD_DIRECTORY}/${eventId}-${width}-${height}.png`)
                                    .then((data4) => {
                                        deleteFile(`${ROOT_DIRECTORY}/${UPLOAD_DIRECTORY}/${data.fileName}`);

                                        if (width == 256 && height == 144) {
                                            let css = `
                                                .no-webp #preview-photo-1 {
                                                    background-image: url('/${eventId}-512-288.png');
                                                    background-image: -webkit-image-set(
                                                        url('/${eventId}-256-144.png') 1x,
                                                        url('/${eventId}-512-288.png') 2x
                                                    );
                                                    background-image: image-set('/${eventId}-256-144.png' 1x, '/${eventId}-512-288.png' 2x);
                                                }
                                                .webp #preview-photo-1 {
                                                    background-image: url('/${eventId}-512-288.webp');
                                                    background-image: -webkit-image-set(
                                                        url('/${eventId}-256-144.webp') 1x,
                                                        url('/${eventId}-512-288.webp') 2x
                                                    );
                                                    background-image: image-set('/${eventId}-256-144.webp' 1x, '/${eventId}-512-288.webp' 2x);
                                                }
                                            `;
                                            data?.socket?.emit('sendCss', { css });
                                        }
                                    });
                            });
                    });
            });
    } catch (err) {
        data?.socket?.emit('sendError', { message: `ERROR: ${JSON.stringify(err)}` });
    }
}

async function getPageContent(data) {
    let mainHeadline = '';
    let mainP = '';
    let previewContent = '<p class="no-preview-p">Derzeit steht keine Vorschau zur Verfügung.</p>';
    let mainButtonSection = '';
    let mainPercentage = '-1%';

    if (data?.id == 'list-events') {
        mainHeadline = data?.displayName;

        const eventArray = await Event.find();

        eventArray.sort((a, b) => {
            if (a.date < b.date) return 1;
            if (a.date > b.date) return -1;
            return 0;
        });

        let selectOptions = '';
        let allCitiesArray = [];
        let allCitiesStrArray = ALL_CITIES?.split('{|,|}');
        allCitiesStrArray?.forEach((cityStr) => {
            allCitiesArray.push(cityStr.split('{|:|}')[0]);
        });
        if (allCitiesArray?.length >= 2) selectOptions += '<option value="All">Alle</option>';
        allCitiesArray?.forEach((city) => {
            selectOptions += `<option value="${city}">${city}</option>`;
        });

        mainP += `
        <span>Filtern nach Ort: </span><select id="filter-for-city" onchange="filterForCity()">${selectOptions}</select>
        <hr />

        <table class="list-events-table">
        <thead>
        <tr>
        <td class="event-id"><span>Event ID</span></td>
        <td class="spacer"></td>
        <td class="event-is-visible"><span>Sicht&shy;bar?</span></td>
        <td class="spacer"></td>
        <td class="event-button"></td>
        <!--<td class="event-button"></td>-->
        <!--<td class="event-button"></td>-->
        </tr>
        <thead>
        `;
        eventArray?.forEach((event) => {
            mainP += `
            <tr class="event-tr ${event.city}">
            <td class="event-id"><span>${event._id}</span></td>
            <td class="spacer"></td>
            <td class="event-is-visible"><span>${event.isVisible ? 'Ja' : 'Nein'}</span></td>
            <td class="spacer"></td>
            <td class="event-button" onclick="showEventInPreview({ _id: '${event._id}' })"><button>Show</button></td>
            <!--<td class="event-button"><button>E</button></td>-->
            <!--<td class="event-button"><button>X</button></td>-->
            </tr>
            `;
        });
        mainP += `
        </tbody>
        </table>
        `;
        return { mainHeadline, mainP, previewContent, mainButtonSection, mainPercentage };
    }

    if (data?.subItems) {
        const subItemArray = data.subItems;

        mainHeadline = data?.displayName;
        mainP = `
        <ul>
        <li><button onclick="selectInNav(${convertObjectToString(subItemArray[0])})">${
            subItemArray[0]?.displayName
        }</button></li>
        <li><button onclick="selectInNav(${convertObjectToString(subItemArray[1])})">${
            subItemArray[1]?.displayName
        }</button></li>
        <li><button onclick="selectInNav(${convertObjectToString(subItemArray[2])})">${
            subItemArray[2]?.displayName
        }</button></li>
        <li><button onclick="selectInNav(${convertObjectToString(subItemArray[3])})">${
            subItemArray[3]?.displayName
        }</button></li>
        </ul>
        `;
        return { mainHeadline, mainP, previewContent, mainButtonSection, mainPercentage };
    }

    mainHeadline = data?.displayName;
    mainP = `
    Willkommen beim '${mainHeadline}'-Setup. <br />Klicke auf 'Weiter', um das Setup zu starten.
    `;

    mainButtonSection = `<div><button onclick="setup({ type: '${data?.id}' })">Weiter</button></div>`;

    return { mainHeadline, mainP, previewContent, mainButtonSection, mainPercentage };
}

async function getPreviewContent(data, socket) {
    let previewContent = '<p class="no-preview-p">Derzeit steht keine Vorschau zur Verfügung.</p>';
    let mainPercentage = 'unchanged';

    if (!data) return { previewContent, mainPercentage };

    try {
        let event = await Event.findOne(data);
        if (!event) return { previewContent, mainPercentage };

        previewContent = `
        <div class="event-div">
            <div id="preview-photo-1" class="event-photo"></div>
            <h4 id="preview-headline">${event.displayName}</h4>
            <p id="preview-p">
                <strong><span id="preview-date">${
                    event.dateAsString + (event.dateAsString.split(' ')[1] ? ' Uhr' : '')
                }</span></strong><br><span id="preview-description">${event.description}</span>
            </p>
            <button>Jetzt anmelden</button>
        </div>
        `;

        let eventId = event._id;
        let css = `
        .no-webp #preview-photo-1 {
            background-image: url('/${eventId}-512-288.png');
            background-image: -webkit-image-set(
                url('/${eventId}-256-144.png') 1x,
                url('/${eventId}-512-288.png') 2x
            );
            background-image: image-set('/${eventId}-256-144.png' 1x, '/${eventId}-512-288.png' 2x);
        }
        .webp #preview-photo-1 {
            background-image: url('/${eventId}-512-288.webp');
            background-image: -webkit-image-set(
                url('/${eventId}-256-144.webp') 1x,
                url('/${eventId}-512-288.webp') 2x
            );
            background-image: image-set('/${eventId}-256-144.webp' 1x, '/${eventId}-512-288.webp' 2x);
        }
        `;

        if (socket) socket.emit('sendCss', { css });

        return { previewContent, mainPercentage };
    } catch (err) {
        return { previewContent, mainPercentage };
    }
}

function convertObjectToString(object) {
    return JSON.stringify(object).replace(/\"/g, "'");
}

async function sendSetupContent(data) {
    let userId = data.userId;
    let socket = data.socket;
    let type = data.type;
    let userInputs = data.inputs;
    let action = data?.action?.toLowerCase() || 'next';

    let { steps, finishSetupFunction } = await getAdditionalSetupInfo(type);

    if (steps?.length == undefined) {
        socket.emit('sendError', { message: 'Diese Funktion wurde noch nicht implementiert.' });
        return;
    }

    let setup = await Setup.findOne({ userId: userId, type: type });
    if (!setup) {
        setup = new Setup({
            userId: userId,
            type: type,
            startedAt: new Date().getTime(),
            currentPage: 0,
            data: '{|,|}',
            tempData: '{|,|}',
            currentPageData: '{|,|}'
        });
    }

    if (action == 'abort') {
        socket.emit('sendPageContent', {
            mainHeadline: 'Setup - Abgebrochen',
            mainP: 'Du hast das Setup abgebrochen.',
            previewContent: '<p class="no-preview-p">Derzeit steht keine Vorschau zur Verfügung.</p>',
            mainButtonSection: '',
            mainPercentage: '0%'
        });
        await setup.remove();
        return;
    }

    if (action == 'back') {
        userInputs?.forEach((userInput) => {
            userInput.id = userInput?.id?.trim();
            userInput.value = userInput?.value?.trim();

            if (userInput?.value?.replace(/\s/g, '') !== '' && userInput?.id?.replace(/\s/g, '') !== '') {
                setup.tempData += `${userInput.id}{|:|}${userInput.value}{|,|}`;
            }
        });

        let previousStep = steps[setup.currentPage - 2];
        if (previousStep) {
            previousStep?.inputs.forEach((input) => {
                let inputId = input.id;
                let setupData = setup.data;
                let sliceStart = setupData.indexOf(inputId);
                let sliceEnd = setupData.indexOf('{|,|}', sliceStart + 1) + 5;
                let removeString = setupData.slice(sliceStart, sliceEnd);
                setup.tempData += removeString;
                setup.data = setup?.data?.replace(removeString, '');
            });
        } else {
            socket.emit('sendPageContent', {
                mainHeadline: 'Erstelle Event - Abgebrochen',
                mainP: "Du hast das 'Event erstellen'-Setup abgebrochen.",
                previewContent: '<p class="no-preview-p">Derzeit steht keine Vorschau zur Verfügung.</p>',
                mainButtonSection: '',
                mainPercentage: '0%'
            });
            await setup.remove();
            return;
        }
    }

    // console.log('- - - - - - - STORE USER INPUT FROM PREVIOUS PAGE - - - - - - -');
    if (action == 'next') {
        userInputs?.forEach(async (userInput) => {
            userInput.id = userInput?.id?.trim();
            userInput.value = userInput?.value?.trim();
            if (
                userInput?.id?.includes('{|,|}') ||
                userInput?.value?.includes('{|,|}') ||
                userInput?.id?.includes('{|:|}') ||
                userInput?.value?.includes('{|:|}') ||
                userInput?.id?.replace(/\s/g, '') === '' ||
                userInput?.value?.replace(/\s/g, '') === '' ||
                userInput?.id?.replace(/\s/g, '') === '[undefined]' ||
                userInput?.value?.replace(/\s/g, '') === '[undefined]'
            ) {
                socket.emit('sendError', {
                    message:
                        'Die Eingabe darf nicht leer sein, nicht [undefined] sein und nicht {|,|} oder {|:|} enthalten.'
                });
                setup.currentPage--;
                return;
            }

            let previousStep = steps[setup.currentPage - 1];
            if (previousStep) {
                try {
                    let result = previousStep.validate(userInput);

                    if (result) {
                        socket.emit('sendError', result);
                        setup.currentPage--;
                        return;
                    }
                } catch (err) {}
            }

            setup.data += `${userInput.id}{|:|}${userInput.value}{|,|}`;
        });
    }

    for (let stepIndex = 0; stepIndex < steps.length; stepIndex++) {
        let step = steps[stepIndex];

        if (!setup?.data?.includes(`{|,|}${step?.inputs[0]?.id}{|:|}`)) {
            setup.currentPage = stepIndex;
            break;
        }
    }

    let currentStep = steps[setup.currentPage];
    if (!currentStep) {
        let result = await finishSetupFunction(setup);

        socket.emit('sendPageContent', result);
        await setup.remove();
        return;
    }

    let { mainHeadline, mainP, inputs } = currentStep;

    let inputsString = '<div id="input-container">';
    setup.currentPageData = '{|,|}';

    inputs.forEach((input) => {
        let value = '';

        if (setup.tempData !== '{|,|}') {
            let inputId = input.id;
            let setupTempData = setup.tempData;
            let sliceStart = setupTempData.indexOf(inputId);
            let sliceEnd = setupTempData.indexOf('{|,|}', sliceStart + 1) + 5;
            let removeString = setupTempData.slice(sliceStart, sliceEnd);
            setup.currentPageData += removeString;
            setup.tempData = setup?.tempData?.replace(removeString, '');

            sliceStart = removeString.indexOf('{|:|}') + 5;
            sliceEnd = removeString.indexOf('{|,|}');

            value = removeString.slice(sliceStart, sliceEnd);
        }
        let overrideValue = value;

        if (!value) {
            try {
                value = input.value(setup);
            } catch (err) {
                value = input.value || '';
            }
        }

        inputsString += `<label for="${input.id}">${input.name}:</label>`;

        if (input.type == 'file') {
            let data = combineStringObjectArray([setup.data]);

            inputsString += `
            <label class="upload-btn">
				Datei zum Hochladen auswählen
			    <input type="file" accept=".png,.jpg,.jpeg" id="${data.eventId}-${input.id}" class="file-upload-input" style="display: none;" onchange="onChangeFileInput()">
			</label>
            <div id="upload-progress-box"></div>
            `;
        } else if (input.type == 'select') {
            inputsString += `<select id="${input.id}" onchange="replaceContent('${input.id}', '${input.replaceInPreview}', '${input.replaceOption}')" >`;
            let values;
            try {
                values = input.values(setup);
            } catch (err) {
                values = input.values || [''];
            }

            if (overrideValue !== '') values[0] = overrideValue;
            let wroteOverrideValue = false;
            values?.forEach((value) => {
                if (value === '' || value !== overrideValue || !wroteOverrideValue) {
                    inputsString += `<option value="${value}">${value}</option>`;
                    if (value === overrideValue) wroteOverrideValue = true;
                }
            });
            inputsString += '</select>';
        } else if (input.type == 'radio') {
            inputsString += '<div class="input-radio">';
            let values;
            try {
                values = input.values(setup);
            } catch (err) {
                values = input.values || [];
            }

            values?.forEach((value, index) => {
                if (overrideValue !== '' && value == overrideValue) input.checked[index] = true;
                if (overrideValue !== '' && value != overrideValue) input.checked[index] = false;

                inputsString += `<input type="radio" name="${input.id}" id="${input.id}" value="${value}"${
                    input?.checked[index] === true ? ' checked' : ''
                }>${value}</input>`;
            });
            inputsString += '</div>';
        } else if (input.type == 'textarea') {
            inputsString += `<textarea name="${input.id}" id="${input.id}" oninput="replaceContent('${input.id}', '${input.replaceInPreview}', '${input.replaceOption}')">${value}</textarea>`;
        } else {
            inputsString += `<input type="${input.type || 'text'}" value="${value}" name="${input.id}" id="${
                input.id
            }" oninput="replaceContent('${input.id}', '${input.replaceInPreview}', '${input.replaceOption}')"></input>`;
        }
    });
    inputsString += '</div>';

    let mainButtonSection = `<div><button onclick="setup({ type: '${type}', action: 'back' })">Zurück</button></div><div><button onclick="setup({ type: '${type}' })">Weiter</button></div><div><button onclick="setup({ type: '${type}', action: 'abort' })">Abbrechen</button></div>`;

    let mainPercentage = `${Math.floor((100 / steps.length) * setup.currentPage)}%`;

    mainP += inputsString;

    previewContent = '';
    try {
        previewContent = currentStep?.previewContent(setup);
    } catch (err) {
        previewContent =
            currentStep?.previewContent || '<p class="no-preview-p">Derzeit steht keine Vorschau zur Verfügung.</p>';
    }

    let dataObject = combineStringObjectArray([setup.data, setup.tempData, setup.currentPageData]);

    let eventId = '[undefined]';

    if (setup?.type == 'create-event' && dataObject?.eventId && dataObject['256-144']) eventId = dataObject?.eventId;
    if (setup?.type != 'create-event' && dataObject?.eventId) eventId = dataObject?.eventId;

    socket.emit('sendCss', {
        css: `
        .no-webp #preview-photo-1 {
            background-image: url('/${eventId}-512-288.png');
            background-image: -webkit-image-set(
                url('/${eventId}-256-144.png') 1x,
                url('/${eventId}-512-288.png') 2x
            );
            background-image: image-set('/${eventId}-256-144.png' 1x, '/${eventId}-512-288.png' 2x);
        }
        .webp #preview-photo-1 {
            background-image: url('/${eventId}-512-288.webp');
            background-image: -webkit-image-set(
                url('/${eventId}-256-144.webp') 1x,
                url('/${eventId}-512-288.webp') 2x
            );
            background-image: image-set('/${eventId}-256-144.webp' 1x, '/${eventId}-512-288.webp' 2x);
        }
    `
    });

    socket.emit('sendPageContent', { mainHeadline, mainP, previewContent, mainButtonSection, mainPercentage });

    setup.currentPage++;

    await setup.save();
}

async function getAdditionalSetupInfo(type) {
    switch (type) {
        case 'create-event':
            return await require('./dashboardsites/create-event')();
        case 'edit-event':
            return await require('./dashboardsites/edit-event')();
        case 'delete-event':
            return await require('./dashboardsites/delete-event')();
    }

    return { steps: null };
}
