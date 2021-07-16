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

            let event = await Event.findById(data.eventId);

            if (!event)
                return {
                    mainHeadline: 'Setup abgebrochen',
                    mainP: `Event ${data.eventId} existiert nicht.`,
                    mainButtonSection: '',
                    mainPercentage: '0%',
                    previewContent: '<p class="no-preview-p">Derzeit steht keine Vorschau zur Verfügung.</p>'
                };

            event.displayName = data.displayName;
            event.dateAsString = data.dateAsString;
            event.date = date;
            event.description = data.description;
            event.isVisible = isVisible;

            try {
                await event.save();
                return {
                    mainHeadline: 'Setup abgeschlossen',
                    mainP: 'Event erfolgreich bearbeitet.',
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
                    mainHeadline: 'Setup abgebrochen',
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
                mainHeadline: 'Bearbeite Event - Event-ID',
                mainP: 'Welches Event möchtest du bearbeiten?',
                previewContent: function (setup) {
                    let object = combineStringObjectArray([setup.tempData, setup.data, setup.currentPageData]);
                    let event = eventArray.find((event) => event._id == object.eventId);

                    if (!event) return '<p class="no-preview-p">Derzeit steht keine Vorschau zur Verfügung.</p>';

                    const fullDateString = event.dateAsString + (event.dateAsString.split(' ')[1] ? ' Uhr' : '');
                    return `
                        <div class="event-div">
                        <div id="preview-photo-1" class="event-photo"></div>
                        <h4 id="preview-headline">${event.displayName}</h4>
                        <p id="preview-p">
                            <strong><span id="preview-date">${fullDateString}</span></strong><br><span id="preview-description">${event.description}</span>
                        </p>
                        <button>Jetzt anmelden</button>
                        </div>
                    `;
                },
                inputs: [
                    {
                        type: 'select',
                        id: 'eventId',
                        name: 'Event-ID',
                        replaceInPreview: 'preview-content',
                        replaceOption: 'fullPreview',
                        values: function (setup) {
                            let array = [''];

                            let testIfOriginalEventIdObject = combineStringObjectArray([setup.currentPageData]);
                            let event = eventArray.find((event) => event._id == testIfOriginalEventIdObject.eventId);
                            // console.log('- - - - - - SELECT EVENT ID - - - - - -');
                            // console.log(event);
                            // console.log(testIfOriginalEventIdObject);

                            if (!event) {
                                eventArray?.forEach((event) => {
                                    array.push(event._id);
                                });
                            }
                            return array;
                        }
                    }
                ],
                validate: function (userInput) {
                    if (userInput.id !== 'eventId') return { message: "userInput.id muss 'eventId' entsprechen." };
                    let message = '';
                    let exists = false;
                    eventArray.forEach((event) => {
                        if (event._id === userInput.value) exists = true;
                    });

                    if (exists == false) {
                        // console.log('- - - - - - - - EXISTIERT NICHT - - - - - - - -');
                        message = `eventId '${userInput.value}' existiert nicht.`;
                    }
                    return message ? { message } : null;
                }
            },
            {
                mainHeadline: 'Bearbeite Event - Anzeigename',
                mainP: 'Wie soll das Event genannt werden? (Groß- / Kleinschreibung ist von Bedeutung)',
                previewContent: function (setup) {
                    let preObject = combineStringObjectArray([setup.tempData, setup.data, setup.currentPageData]);
                    let event = eventArray.find((event) => event._id == preObject.eventId);

                    if (!event) return '<p class="no-preview-p">Derzeit steht keine Vorschau zur Verfügung.</p>';

                    let eventString = '{|,|}';
                    eventString += `dateAsString{|:|}${event.dateAsString}{|,|}`;
                    eventString += `description{|:|}${event.description}{|,|}`;
                    eventString += `displayName{|:|}${event.displayName}{|,|}`;

                    let object = combineStringObjectArray([
                        eventString,
                        setup.tempData,
                        setup.data,
                        setup.currentPageData
                    ]);

                    const fullDateString = object.dateAsString + (object.dateAsString.split(' ')[1] ? ' Uhr' : '');

                    return `
                    <div class="event-div">
                    <div id="preview-photo-1" class="event-photo"></div>
                    <h4 id="preview-headline">${object.displayName || 'EVENT NAME'}</h4>
                    <p id="preview-p">
                        <strong><span id="preview-date">${
                            fullDateString || '01.01.2000'
                        }</span></strong><br><span id="preview-description">${
                        object.description || 'EVENTBESCHREIBUNG'
                    }</span>
                    </p>
                    <button>Jetzt anmelden</button>
                    </div>
                    `;
                },
                inputs: [
                    {
                        type: 'text',
                        id: 'displayName',
                        name: 'Eventname',
                        replaceInPreview: 'preview-headline',
                        value: function (setup) {
                            let object = convertStringToObject(setup.data);
                            let event = eventArray.find((event) => event._id == object.eventId);

                            return event.displayName || '';
                        }
                    }
                ]
            },
            {
                mainHeadline: 'Bearbeite Event - Zeitangabe',
                mainP: 'Wann wird das Event stattfinden? Mögliche Formate für die Zeitangabe sind: <ul><li>DD.MM.YYYY</li><li>DD.MM.YYYY hh</li><li>DD.MM.YYYY hh:mm</li><li>DD.MM.YYYY hh:mm:ss</li></ul> Beispiele: <ul><li>17.07.2021 ➞ entspricht 17. Juli 2021</li><li>17.07.2021 17 ➞ entspricht 17.Juli 2021 um 17 Uhr</li><li>17.07.2021 17:05 ➞ entspricht 17. Juli 2021 um 17:05 Uhr</li><li>17.07.2021 17:05:12 ➞ entspricht 17. Juli 2021 um 17:05:12 Uhr</li></ul>',
                previewContent: function (setup) {
                    let preObject = combineStringObjectArray([setup.tempData, setup.data, setup.currentPageData]);
                    let event = eventArray.find((event) => event._id == preObject.eventId);

                    if (!event) return '<p class="no-preview-p">Derzeit steht keine Vorschau zur Verfügung.</p>';

                    let eventString = '{|,|}';
                    eventString += `dateAsString{|:|}${event.dateAsString}{|,|}`;
                    eventString += `description{|:|}${event.description}{|,|}`;
                    eventString += `displayName{|:|}${event.displayName}{|,|}`;

                    let object = combineStringObjectArray([
                        eventString,
                        setup.tempData,
                        setup.data,
                        setup.currentPageData
                    ]);

                    const fullDateString = object.dateAsString + (object.dateAsString.split(' ')[1] ? ' Uhr' : '');

                    return `
                    <div class="event-div">
                    <div id="preview-photo-1" class="event-photo"></div>
                    <h4 id="preview-headline">${object.displayName || 'EVENT NAME'}</h4>
                    <p id="preview-p">
                        <strong><span id="preview-date">${
                            fullDateString || '01.01.2000'
                        }</span></strong><br><span id="preview-description">${
                        object.description || 'EVENTBESCHREIBUNG'
                    }</span>
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
                        replaceOption: 'fullDateString',
                        value: function (setup) {
                            let object = convertStringToObject(setup.data);
                            let event = eventArray.find((event) => event._id == object.eventId);

                            return event.dateAsString || '';
                        }
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
                mainHeadline: 'Bearbeite Event - Beschreibung',
                mainP: 'Auf der Website wird für jedes Event eine kurze Beschreibung angegeben. Diese sollte erklären, warum beziehungsweise was gefeiert wird. Bitte gib eine Beschreibung an:',
                previewContent: function (setup) {
                    let preObject = combineStringObjectArray([setup.tempData, setup.data, setup.currentPageData]);
                    let event = eventArray.find((e) => e._id == preObject.eventId);

                    if (!event) return '<p class="no-preview-p">Derzeit steht keine Vorschau zur Verfügung.</p>';

                    let eventString = '{|,|}';
                    // console.log('- - - - - EVENT STRING - - - - - -');
                    eventString += `dateAsString{|:|}${event.dateAsString}{|,|}`;
                    eventString += `description{|:|}${event.description}{|,|}`;
                    eventString += `displayName{|:|}${event.displayName}{|,|}`;

                    // console.log('DEV MARKER 2 - - - - - - - - - -');

                    let object = combineStringObjectArray([
                        eventString,
                        setup.tempData,
                        setup.data,
                        setup.currentPageData
                    ]);

                    // console.log('- - - - - - EDIT EVENT - DESCRIPTION - - - - - -');
                    // console.log(event);
                    // console.log('- - - -');
                    // console.log(eventString);
                    // console.log('- - - -');
                    // console.log(setup.tempData);
                    // console.log('- - - -');
                    // console.log(setup.data);
                    // console.log('- - - -');
                    // console.log(setup.currentPageData);
                    // console.log('- - - -');

                    const fullDateString = object.dateAsString + (object.dateAsString.split(' ')[1] ? ' Uhr' : '');

                    return `
                    <div class="event-div">
                    <div id="preview-photo-1" class="event-photo"></div>
                    <h4 id="preview-headline">${object.displayName || 'EVENT NAME'}</h4>
                    <p id="preview-p">
                        <strong><span id="preview-date">${
                            fullDateString || '01.01.2000'
                        }</span></strong><br><span id="preview-description">${
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
                        replaceInPreview: 'preview-description',
                        value: function (setup) {
                            let object = convertStringToObject(setup.data);
                            let event = eventArray.find((event) => event._id == object.eventId);

                            return event.description || '';
                        }
                    }
                ]
            },
            {
                mainHeadline: 'Bearbeite Event - Sichtbarkeit',
                mainP: 'Soll das Event auf der Website sichtbar sein oder soll es zunächst unsichtbar sein. Wenn ein Event auf unsichtbar gestellt ist, dann ist dieses auf der Website nicht zu sehen und es können auch keine Anmeldungen für dieses Event durchgeführt werden',
                previewContent: function (setup) {
                    let preObject = combineStringObjectArray([setup.tempData, setup.data, setup.currentPageData]);
                    let event = eventArray.find((event) => event._id == preObject.eventId);

                    if (!event) return '<p class="no-preview-p">Derzeit steht keine Vorschau zur Verfügung.</p>';

                    let eventString = '{|,|}';
                    eventString += `dateAsString{|:|}${event.dateAsString}{|,|}`;
                    eventString += `description{|:|}${event.description}{|,|}`;
                    eventString += `displayName{|:|}${event.displayName}{|,|}`;

                    let object = combineStringObjectArray([
                        eventString,
                        setup.tempData,
                        setup.data,
                        setup.currentPageData
                    ]);

                    const fullDateString = object.dateAsString + (object.dateAsString.split(' ')[1] ? ' Uhr' : '');

                    return `
                    <div class="event-div">
                    <div id="preview-photo-1" class="event-photo"></div>
                    <h4 id="preview-headline">${object.displayName || 'EVENT NAME'}</h4>
                    <p id="preview-p">
                        <strong><span id="preview-date">${
                            fullDateString || '01.01.2000'
                        }</span></strong><br><span id="preview-description">${
                        object.description || 'EVENTBESCHREIBUNG'
                    }</span>
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
