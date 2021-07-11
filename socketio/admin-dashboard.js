const Admin = require('../models/admin');
const Event = require('../models/event');
const Setup = require('../models/setup');

module.exports = function (io, sessionMiddleware, passport) {
    const wrap = (middleware) => (socket, next) => middleware(socket.request, {}, next);

    io.use(wrap(sessionMiddleware));
    io.use(wrap(passport.initialize()));
    io.use(wrap(passport.session()));

    io.of('/admin/dashboard2').use((socket, next) => {
        const referer = socket.handshake.headers.referer;
        const pathName = '/' + referer.split('/').slice(3).join('/');

        if (pathName === '/admin/dashboard2') sessionMiddleware(socket.request, {}, next);
    });

    io.of('/admin/dashboard2').on('connection', async (socket) => {
        let userId = socket.request.session.passport?.user;

        const admin = await Admin.findById(userId);
        if (!admin) return;

        console.log('UserId: ' + userId);

        socket.on('selectInNav', async (data) => {
            socket.emit('sendPageContent', await getPageContent(data));
        });
        socket.on('sendPreviewContent', async (data) => {});
        socket.on('setup', async (data) => {
            data.userId = admin?._id;
            data.socket = socket;
            await sendSetupContent(data);
        });
    });
};

async function getPageContent(data) {
    let mainHeadline = '';
    let mainP = '';
    let previewContent = '<p class="no-preview-p">Derzeit steht keine Vorschau zur Verfügung.</p>';
    let mainButtonSection = '';
    let mainPercentage = '-1%';

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

async function getPreviewContent(data) {
    let previewContent = '<p class="no-preview-p">Derzeit steht keine Vorschau zur Verfügung.</p>';

    if (!data) return { previewContent };

    let event = await Event.findOne(data);
    if (!event) return { previewContent };
}

function convertObjectToString(object) {
    return JSON.stringify(object).replace(/\"/g, "'");
}

async function sendSetupContent(data) {
    console.log('# # # # # # # # NEW CONNECTION # # # # # # # #');
    let userId = data.userId;
    let socket = data.socket;
    let type = data.type;
    let userInputs = data.inputs;
    let action = data?.action?.toLowerCase() || 'next';

    console.log('- - - - - - - - ALL DATA - BEGINNING - - - - - - - -');
    console.log(userId);
    console.log(socket.id);
    console.log(type);
    console.log(userInputs);
    console.log(action);

    let { steps, finishSetupFunction } = await getAdditionalSetupInfo(type);
    console.log('- - - - - - - - ALL STEPS - BEGINNING - - - - - - - -');
    console.log(steps);

    if (steps?.length == undefined) {
        socket.emit('sendError', { message: 'Diese Funktion wurde noch nicht implementiert.' });
        return;
    }

    console.log('- - - - - - - - FIND ONE SETUP - BEGINNING - - - - - - - -');
    let setup = await Setup.findOne({ userId: userId, type: type });
    console.log(setup);
    if (!setup) {
        setup = new Setup({
            userId: userId,
            type: type,
            startedAt: new Date().getTime(),
            currentPage: 0,
            data: '{|,|}'
        });
    }
    console.log(setup);

    console.log(`- - - - - - - - CHECK IF ACTION IS 'BACK' OR 'ABORT'`);
    console.log(action);
    if (action == 'abort') {
        socket.emit('sendPageContent', {
            mainHeadline: 'Erstelle Event - Abgebrochen',
            mainP: "Du hast das 'Event erstellen'-Setup abgebrochen.",
            previewContent: '<p class="no-preview-p">Derzeit steht keine Vorschau zur Verfügung.</p>',
            mainButtonSection: '',
            mainPercentage: '-1%'
        });
        await setup.remove();
        return;
    }

    console.log('- - - - - - - STORE USER INPUT FROM PREVIOUS PAGE - - - - - - -');
    if (action == 'next') {
        userInputs?.forEach(async (userInput) => {
            /* VALIDATE */
            console.log('- - - - - - - - VALUE - - - - - - - -');
            console.log(userInput.value);
            if (
                userInput?.id?.includes('{|,|}') ||
                userInput?.value?.includes('{|,|}') ||
                userInput?.id?.includes('{|:|}') ||
                userInput?.value?.includes('{|:|}') ||
                userInput?.id?.replace(/\s/g, '') === '' ||
                userInput?.value?.replace(/\s/g, '') === ''
            ) {
                console.log('- - - - - - - - ERROR - - - - - - - -');
                console.log('VALUE DARF NICHT {|,|} UND {|:|} ENTHALTEN');
                socket.emit('sendError', {
                    message: 'Die Eingabe darf nicht leer sein und nicht {|,|} oder {|:|} enthalten.'
                });
                setup.currentPage--;
                return;
            }

            let previousStep = steps[setup.currentPage - 1];
            if (previousStep) {
                try {
                    let result = previousStep.validate(userInput);
                    console.log(result);

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
    console.log(setup);

    console.log('- - - - - - - - GO TO LAST SEEN PAGE - - - - - - - -');
    console.log(setup.currentPage);
    for (let stepIndex = 0; stepIndex < steps.length; stepIndex++) {
        let step = steps[stepIndex];

        console.log(setup?.data);
        console.log(`{|,|}${step?.inputs[0]?.id}{|:|}`);
        if (!setup?.data?.includes(`{|,|}${step?.inputs[0]?.id}{|:|}`)) {
            setup.currentPage = stepIndex;
            break;
        }
    }
    console.log(setup.currentPage);

    let currentStep = steps[setup.currentPage];
    if (!currentStep) {
        console.log('- - - - - - - - FINISHED - - - - - - - -');

        let result = await finishSetupFunction(setup);

        socket.emit('sendPageContent', result);
        console.log(setup);
        console.log('- - - - - - REMOVE SETUP - - - - - -');
        await setup.remove();
        return;
    }

    let { mainHeadline, mainP, inputs } = currentStep;
    console.log('- - - - - - - - CURRENT PAGE INFO - - - - - - - -');
    console.log(mainHeadline);
    console.log(mainP);
    //console.log(previewContent);
    console.log(inputs);

    let inputsString = '<div id="input-container">';

    inputs.forEach((input) => {
        let value = '';
        try {
            value = input.value(setup);
        } catch (err) {
            value = input.value || '';
        }

        inputsString += `<label for="${input.id}">${input.name}:</label>`;

        if (input.type == 'select') {
            inputsString += `<select id="${input.id}">`;
            let values;
            try {
                values = input.values(setup);
            } catch (err) {
                values = input.values || [];
            }

            values?.forEach((value) => {
                inputsString += `<option value="${value}">${value}</option>`;
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
                inputsString += `<input type="radio" name="${input.id}" id="${input.id}" value="${value}"${
                    input?.checked[index] === true ? ' checked' : ''
                }>${value}</input>`;
            });
            inputsString += '</div>';
        } else if (input.type == 'textarea') {
            inputsString += `<textarea value="${value}" name="${input.id}" id="${input.id}" oninput="replaceContent('${input.id}', '${input.replaceInPreview}', '${input.replaceOption}')"></textarea>`;
        } else {
            inputsString += `<input type="${input.type || 'text'}" value="${value}" name="${input.id}" id="${
                input.id
            }" oninput="replaceContent('${input.id}', '${input.replaceInPreview}', '${input.replaceOption}')"></input>`;
        }
    });
    inputsString += '</div>';

    let mainButtonSection = `<div><button onclick="setup({ type: '${type}' })">Weiter</button></div><div><button onclick="setup({ type: '${type}', action: 'abort' })">Abbrechen</button></div>`;

    let mainPercentage = `${Math.floor((100 / steps.length) * setup.currentPage)}%`;

    mainP += inputsString;

    previewContent = '';
    try {
        previewContent = currentStep?.previewContent(setup);
    } catch (err) {
        previewContent =
            currentStep?.previewContent || '<p class="no-preview-p">Derzeit steht keine Vorschau zur Verfügung.</p>';
    }

    socket.emit('sendPageContent', { mainHeadline, mainP, previewContent, mainButtonSection, mainPercentage });

    setup.currentPage++;

    await setup.save();
    console.log('- - - - - - - FIRST SETUP SAVE - - - - - - - -');
    console.log(setup);
}

async function getAdditionalSetupInfo(type) {
    switch (type) {
        case 'create-event':
            return await require('./dashboardsites/create-event')();
        case 'delete-event':
            return await require('./dashboardsites/delete-event')();
    }

    return { steps: null };
}
