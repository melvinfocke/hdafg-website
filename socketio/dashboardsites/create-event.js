const Event = require('../../models/event');
const { convertToDate } = require('../../functions/date');
const { convertStringToObject, combineStringObjectArray } = require('../../functions/object');

module.exports = async function () {
    let eventArray = await Event.find();
    return {
        finishSetupFunction: async function (setup) {
            let data = convertStringToObject(setup.data);
            let isVisible = data?.isVisible?.toLowerCase() == 'ja' ? true : false;
            // console.log(data.dateAsString);
            let date = convertToDate(data.dateAsString);
            let newEvent = new Event({
                _id: data.eventId,
                displayName: data.displayName,
                dateAsString: data.dateAsString,
                date: date,
                description: data.description,
                isVisible: isVisible
            });
            try {
                await newEvent.save();
                return {
                    mainHeadline: 'Set&shy;up ab&shy;ge&shy;schlos&shy;sen',
                    mainP: 'Event er&shy;folg&shy;reich er&shy;stellt.',
                    mainButtonSection: '',
                    mainPercentage: '100%',
                    previewContent: `
                    <div class="event-div">
                    <div id="preview-photo-1" class="event-photo"></div>
                    <h4 id="preview-headline">${data.displayName}</h4>
                    <p id="preview-p">
                        <strong><span id="preview-date">${
                            data.dateAsString + (data?.dateAsString?.split(' ')[1] ? ' Uhr' : '')
                        }</span></strong><br><span id="preview-description">${data.description}</span>
                    </p>
                    <button>Jetzt anmelden</button>
                    </div>
                    `
                };
            } catch (err) {
                return {
                    mainHeadline: 'Set&shy;up ab&shy;ge&shy;bro&shy;chen',
                    mainP: JSON.stringify(err),
                    mainButtonSection: '',
                    mainPercentage: '0%',
                    previewContent: `
                    <div class="event-div">
                    <div id="preview-photo-1" class="event-photo"></div>
                    <h4 id="preview-headline">${data.displayName}</h4>
                    <p id="preview-p">
                        <strong><span id="preview-date">${
                            data.dateAsString + (data?.dateAsString?.split(' ')[1] ? ' Uhr' : '')
                        }</span></strong><br><span id="preview-description">${data.description}</span>
                    </p>
                    <button>Jetzt anmelden</button>
                    </div>
                    `
                };
            }
        },
        steps: [
            {
                mainHeadline: 'Er&shy;stel&shy;le Event - An&shy;zei&shy;ge&shy;na&shy;me',
                mainP: 'Wie soll das Event ge&shy;nannt wer&shy;den? (Groß- / Klein&shy;schrei&shy;bung ist von Be&shy;deu&shy;tung)',
                previewContent: function (setup) {
                    let object = combineStringObjectArray([setup.tempData, setup.data, setup.currentPageData]);

                    let fullDateString = '';
                    try {
                        fullDateString = object.dateAsString + (object.dateAsString.split(' ')[1] ? ' Uhr' : '');
                    } catch (err) {}

                    return `
            <div class="event-div">
            <div id="preview-photo-1" class="event-photo"></div>
            <h4 id="preview-headline">${object.displayName || 'EVENT NAME'}</h4>
            <p id="preview-p">
                <strong><span id="preview-date">${
                    fullDateString || '01.01.2000'
                }</span></strong><br><span id="preview-description">${object.description || 'EVENTBESCHREIBUNG'}</span>
            </p>
            <button>Jetzt anmelden</button>
            </div>
            `;
                },
                inputs: [{ type: 'text', id: 'displayName', name: 'Eventname', replaceInPreview: 'preview-headline' }]
            },
            {
                mainHeadline: 'Er&shy;stel&shy;le Event - Event-ID',
                mainP: "Je&shy;des Event be&shy;sitzt ei&shy;nen ein&shy;deu&shy;ti&shy;gen Iden&shy;ti&shy;fier, wel&shy;cher un&shy;ter an&shy;de&shy;rem für die Be&shy;nen&shy;nung von Bil&shy;dern ver&shy;wen&shy;det wird. Falls der au&shy;to&shy;ma&shy;tisch ge&shy;ne&shy;rier&shy;te Iden&shy;ti&shy;fier für dich in Ord&shy;nung ist, kli&shy;cke auf 'Weiter', falls nicht, än&shy;de&shy;re den Iden&shy;ti&shy;fier und kli&shy;cke da&shy;nach auf 'Weiter'",
                previewContent: function (setup) {
                    let object = combineStringObjectArray([setup.tempData, setup.data, setup.currentPageData]);

                    let fullDateString = '';
                    try {
                        fullDateString = object.dateAsString + (object.dateAsString.split(' ')[1] ? ' Uhr' : '');
                    } catch (err) {}

                    return `
    <div class="event-div">
    <div id="preview-photo-1" class="event-photo"></div>
    <h4 id="preview-headline">${object.displayName}</h4>
    <p id="preview-p">
        <strong><span id="preview-date">${
            fullDateString || '01.01.2000'
        }</span></strong><br><span id="preview-description">${object.description || 'EVENTBESCHREIBUNG'}</span>
    </p>
    <button>Jetzt anmelden</button>
    </div>
                `;
                },
                inputs: [
                    {
                        type: 'text',
                        id: 'eventId',
                        name: 'Event-ID',
                        value: function (setup) {
                            let object = convertStringToObject(setup.data);
                            let eventId = object?.displayName?.toLowerCase()?.replace(/\s+/g, '-');

                            let suffix = '';
                            for (let i = 0; i < 9; i++) {
                                let doesExist = false;
                                eventArray.forEach((event) => {
                                    if (event._id == `${eventId}${suffix}`) doesExist = true;
                                });
                                if (!doesExist) return `${eventId}${suffix}`;

                                suffix = suffix === '' ? 2 : suffix + 1;
                                // console.log('- - - - - - SUFFIX - - - - - -');
                                // console.log(suffix);
                            }
                            return '';
                        }
                    }
                ],
                validate: function (userInput) {
                    if (userInput.id !== 'eventId') return { message: "userInput.id muss 'eventId' entsprechen." };
                    let message = '';
                    if (/\s/g.test(userInput?.value)) {
                        return { message: 'Die Event-ID darf keine Leerzeichen enthalten.' };
                    }
                    eventArray.forEach((event) => {
                        if (event._id == userInput.value) {
                            // console.log('- - - - - - - - EXISTIERT BEREITS - - - - - - - -');
                            message = `eventId '${event._id}' existiert bereits.`;
                        }
                    });
                    return message ? { message } : null;
                }
            },
            {
                mainHeadline: 'Er&shy;stel&shy;le Event - Zeit&shy;an&shy;ga&shy;be',
                mainP: 'Wann wird das Event statt&shy;fin&shy;den? Mög&shy;li&shy;che For&shy;ma&shy;te für die Zeit&shy;an&shy;gabe sind: <ul><li>DD.MM.YYYY</li><li>DD.MM.YYYY hh</li><li>DD.MM.YYYY hh:mm</li><li>DD.MM.YYYY hh:mm:ss</li></ul> Bei&shy;spie&shy;le: <ul><li>17.07.2021 ➞ ent&shy;spricht 17. Juli 2021</li><li>17.07.2021 17 ➞ ent&shy;spricht 17.Juli 2021 um 17 Uhr</li><li>17.07.2021 17:05 ➞ ent&shy;spricht 17. Juli 2021 um 17:05 Uhr</li><li>17.07.2021 17:05:12 ➞ ent&shy;spricht 17. Juli 2021 um 17:05:12 Uhr</li></ul>',
                previewContent: function (setup) {
                    let object = combineStringObjectArray([setup.tempData, setup.data, setup.currentPageData]);

                    let fullDateString = '';
                    try {
                        fullDateString = object.dateAsString + (object.dateAsString.split(' ')[1] ? ' Uhr' : '');
                    } catch (err) {}

                    return `
    <div class="event-div">
    <div id="preview-photo-1" class="event-photo"></div>
    <h4 id="preview-headline">${object.displayName}</h4>
    <p id="preview-p">
        <strong><span id="preview-date">${
            fullDateString || '01.01.2000'
        }</span></strong><br><span id="preview-description">${object.description || 'EVENTBESCHREIBUNG'}</span>
    </p>
    <button>Jetzt anmelden</button>
    </div>
                `;
                },
                inputs: [
                    {
                        type: 'text',
                        id: 'dateAsString',
                        name: 'Datum',
                        replaceInPreview: 'preview-date',
                        replaceOption: 'fullDateString'
                    }
                ],
                validate: function (userInput) {
                    if (userInput.id !== 'dateAsString') {
                        return { message: "userInput.id muss 'dateAsString' entsprechen." };
                    }
                    // console.log(convertToDate(userInput.value));

                    let message = '';
                    if (isNaN(convertToDate(userInput.value))) {
                        message = `'${userInput.value}' konnte in kein Datum umgewandelt werden.`;
                    }
                    return message ? { message } : null;
                }
            },
            {
                mainHeadline: 'Er&shy;stel&shy;le Event - Be&shy;schrei&shy;bung',
                mainP: 'Auf der Web&shy;site wird für je&shy;des Event eine kur&shy;ze Be&shy;schrei&shy;bung an&shy;ge&shy;ge&shy;ben. Die&shy;se soll&shy;te er&shy;klä&shy;ren, wa&shy;rum be&shy;zie&shy;hungs&shy;wei&shy;se was ge&shy;fei&shy;ert wird. Bit&shy;te gib ei&shy;ne Be&shy;schrei&shy;bung an:',
                previewContent: function (setup) {
                    let object = combineStringObjectArray([setup.tempData, setup.data, setup.currentPageData]);
                    const fullDateString = object.dateAsString + (object.dateAsString.split(' ')[1] ? ' Uhr' : '');

                    return `
    <div class="event-div">
    <div id="preview-photo-1" class="event-photo"></div>
    <h4 id="preview-headline">${object.displayName}</h4>
    <p id="preview-p">
        <strong><span id="preview-date">${fullDateString}</span></strong><br><span id="preview-description">${
                        object.description || 'EVENTBESCHREIBUNG'
                    }</span>
    </p>
    <button>Jetzt anmelden</button>
    </div>
                `;
                },
                inputs: [
                    {
                        type: 'textarea',
                        id: 'description',
                        name: 'Beschreibung',
                        replaceInPreview: 'preview-description'
                    }
                ]
            },
            {
                mainHeadline: 'Er&shy;stel&shy;le Event - Sicht&shy;bar&shy;keit',
                mainP: 'Soll das Event auf der Web&shy;site sicht&shy;bar sein oder soll es zu&shy;nächst un&shy;sicht&shy;bar sein? Wenn ein Event auf un&shy;sicht&shy;bar ge&shy;stellt ist, dann ist dieses auf der Web&shy;site nicht zu se&shy;hen und es kön&shy;nen auch kei&shy;ne An&shy;mel&shy;dun&shy;gen für die&shy;ses Event durch&shy;ge&shy;führt wer&shy;den.',
                previewContent: function (setup) {
                    let object = combineStringObjectArray([setup.tempData, setup.data, setup.currentPageData]);
                    const fullDateString = object.dateAsString + (object.dateAsString.split(' ')[1] ? ' Uhr' : '');

                    return `
    <div class="event-div">
    <div id="preview-photo-1" class="event-photo"></div>
    <h4 id="preview-headline">${object.displayName}</h4>
    <p id="preview-p">
        <strong><span id="preview-date">${fullDateString}</span></strong><br><span id="preview-description">${object.description}</span>
    </p>
    <button>Jetzt anmelden</button>
    </div>
                `;
                },
                inputs: [
                    {
                        type: 'radio',
                        id: 'isVisible',
                        name: 'Sichtbarkeit',
                        values: ['Ja', 'Nein'],
                        checked: [false, true]
                    }
                ]
            },
            {
                mainHeadline: 'Er&shy;stel&shy;le Event - Bild 1/2 hoch&shy;la&shy;den',
                mainP: 'Nun muss ein Bild hoch&shy;ge&shy;la&shy;den wer&shy;den. Das Bild wird über dem Ti&shy;tel des Events in der "Al&shy;le an&shy;ste&shy;hen&shy;den Events"-Sek&shy;tion an&shy;ge&shy;zeigt (sie&shy;he Vor&shy;schau rechts). Das hoch&shy;ge&shy;la&shy;de&shy;ne Bild soll&shy;te fol&shy;gen&shy;de Vor&shy;aus&shy;set&shy;zun&shy;gen er&shy;fül&shy;len: <ul><li>Das Sei&shy;ten&shy;ver&shy;hält&shy;nis be&shy;trägt 16:9. An&shy;sons&shy;ten wird das Bild au&shy;to&shy;ma&shy;tisch auf ein 16:9 Sei&shy;ten&shy;ver&shy;hält&shy;nis zu&shy;recht&shy;ge&shy;schnit&shy;ten.</li><li>Die Auf&shy;lö&shy;sung be&shy;trägt min&shy;des&shy;tens 512&nbsp;×&nbsp;288&nbsp;Pixel.</li><li>Das Bild muss im PNG-, JPG- oder JPEG-For&shy;mat hoch&shy;ge&shy;la&shy;den wer&shy;den.</li></ul>',
                previewContent: function (setup) {
                    let object = combineStringObjectArray([setup.tempData, setup.data, setup.currentPageData]);
                    const fullDateString = object.dateAsString + (object.dateAsString.split(' ')[1] ? ' Uhr' : '');

                    return `
    <div class="event-div">
    <div id="preview-photo-1" class="event-photo"></div>
    <h4 id="preview-headline">${object.displayName}</h4>
    <p id="preview-p">
        <strong><span id="preview-date">${fullDateString}</span></strong><br><span id="preview-description">${object.description}</span>
    </p>
    <button>Jetzt anmelden</button>
    </div>
                `;
                },
                inputs: [
                    {
                        type: 'file',
                        id: '256-144',
                        name: 'Event Bild 1'
                    }
                ]
            },
            {
                mainHeadline: 'Er&shy;stel&shy;le Event - Bild 2/2 hoch&shy;la&shy;den',
                mainP: 'Jetzt muss noch ein zwei&shy;tes Bild hoch&shy;ge&shy;la&shy;den wer&shy;den. Die&shy;ses Bild wird links ne&shy;ben dem An&shy;mel&shy;de&shy;for&shy;mu&shy;lar ei&shy;nes Events an&shy;ge&shy;zeigt, al&shy;ler&shy;dings nur auf der Tablet- und Computer&shy;ansicht der Web&shy;site. Das hoch&shy;ge&shy;la&shy;de&shy;ne Bild sol&shy;lte fol&shy;gen&shy;de Vor&shy;aus&shy;set&shy;zun&shy;gen er&shy;fül&shy;len: <ul><li>Das Sei&shy;ten&shy;ver&shy;hält&shy;nis be&shy;trägt 16:21 be&shy;zie&shy;hungs&shy;wei&shy;se 1:1,3125. Da die&shy;ses Sei&shy;ten&shy;ver&shy;hält&shy;nis eher un&shy;ty&shy;pisch ist, kann auch ein Bild im 3:4 Sei&shy;ten&shy;ver&shy;hält&shy;nis hoch&shy;ge&shy;la&shy;den wer&shy;den. Dann wird aber oben und unten vom Bild ein klei&shy;ner Teil ab&shy;ge&shy;schnit&shy;ten.</li><li>Die Auf&shy;lö&shy;sung be&shy;trägt min&shy;des&shy;tens 800&nbsp;×&nbsp;1050&nbsp;Pixel. Falls das Bild im 3:4 Sei&shy;ten&shy;ver&shy;hält&shy;nis vor&shy;han&shy;den ist, sol&shy;lte die Auf&shy;lö&shy;sung min&shy;des&shy;tens 800&nbsp;×&nbsp;1068&nbsp;Pixel be&shy;tra&shy;gen. Bei an&shy;de&shy;ren Sei&shy;ten&shy;ver&shy;hält&shy;nis&shy;sen sol&shy;lte das Bild in der ho&shy;ri&shy;zon&shy;ta&shy;len Rich&shy;tung (x-Rich&shy;tung) min&shy;des&shy;tens 800&nbsp;Pixel be&shy;sit&shy;zen. Je&shy;des hoch&shy;ge&shy;la&shy;de&shy;ne Bild wird au&shy;to&shy;ma&shy;tisch an das 16:21 Sei&shy;ten&shy;ver&shy;hält&shy;nis an&shy;ge&shy;passt.</li><li>Bei der Tablet-An&shy;sicht der Web&shy;site wird der linke Teil des Bil&shy;des ab&shy;ge&shy;schnit&shy;ten. Das Haupt&shy;mo&shy;tiv sol&shy;lte sich da&shy;her auf der rech&shy;ten Sei&shy;te des Bil&shy;des be&shy;fin&shy;den.</li><li>Das Bild muss im PNG-, JPG- oder JPEG-For&shy;mat hoch&shy;ge&shy;laden wer&shy;den.</li></ul>',
                previewContent: function (setup) {
                    let object = combineStringObjectArray([setup.tempData, setup.data, setup.currentPageData]);
                    const fullDateString = object.dateAsString + (object.dateAsString.split(' ')[1] ? ' Uhr' : '');

                    return `
    <div class="event-div">
    <div id="preview-photo-1" class="event-photo"></div>
    <h4 id="preview-headline">${object.displayName}</h4>
    <p id="preview-p">
        <strong><span id="preview-date">${fullDateString}</span></strong><br><span id="preview-description">${object.description}</span>
    </p>
    <button>Jetzt anmelden</button>
    </div>
                `;
                },
                inputs: [
                    {
                        type: 'file',
                        id: '400-525',
                        name: 'Event Bild 2'
                    }
                ]
            }
        ]
    };
};
