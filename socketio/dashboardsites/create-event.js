const Event = require('../../models/event');
const { convertToDate } = require('../../functions/date');
const { convertStringToObject } = require('../../functions/object');

module.exports = async function () {
    let eventArray = await Event.find();
    return {
        finishSetupFunction: async function (setup) {
            let data = convertStringToObject(setup.data);
            let isVisible = data?.isVisible?.toLowerCase() == 'ja' ? true : false;
            console.log(data.dateAsString);
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
                    mainHeadline: 'Setup abgeschlossen',
                    mainP: 'Event erfolgreich erstellt.',
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
                mainHeadline: 'Erstelle Event - Anzeigename',
                mainP: 'Wie soll das Event genannt werden? (Groß- / Kleinschreibung ist von Bedeutung)',
                previewContent: `
            <div class="event-div">
            <div id="preview-photo-1" class="event-photo"></div>
            <h4 id="preview-headline">EVENTNAME</h4>
            <p id="preview-p">
                <strong><span id="preview-date">01.01.2000</span></strong><br><span id="preview-description">EVENTBESCHREIBUNG</span>
            </p>
            <button>Jetzt anmelden</button>
            </div>
            `,
                inputs: [{ type: 'text', id: 'displayName', name: 'Eventname', replaceInPreview: 'preview-headline' }]
            },
            {
                mainHeadline: 'Erstelle Event - Event-ID',
                mainP: "Jedes Event besitzt einen eindeutigen Identifier, welcher unter anderem für die Benennung von Bildern verwendet wird. Falls der automatisch generierte Identifier für dich in Ordnung ist, klicke auf 'Weiter', falls nicht, ändere den Identifier und klicke danach auf 'Weiter'",
                previewContent: function (setup) {
                    let object = convertStringToObject(setup.data);

                    return `
    <div class="event-div">
    <div id="preview-photo-1" class="event-photo"></div>
    <h4 id="preview-headline">${object.displayName}</h4>
    <p id="preview-p">
        <strong><span id="preview-date">01.01.2000</span></strong><br><span id="preview-description">EVENTBESCHREIBUNG</span>
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
                            let eventId = object?.displayName?.toLowerCase()?.replace(' ', '-');

                            let suffix = '';
                            for (let i = 0; i < 9; i++) {
                                let doesExist = false;
                                eventArray.forEach((event) => {
                                    if (event._id == `${eventId}${suffix}`) doesExist = true;
                                });
                                if (!doesExist) return `${eventId}${suffix}`;

                                suffix = suffix === '' ? 2 : suffix + 1;
                                console.log('- - - - - - SUFFIX - - - - - -');
                                console.log(suffix);
                            }
                            return '';
                        }
                    }
                ],
                validate: function (userInput) {
                    if (userInput.id !== 'eventId') return { message: "userInput.id muss 'eventId' entsprechen." };
                    let message = '';
                    eventArray.forEach((event) => {
                        if (event._id == userInput.value) {
                            console.log('- - - - - - - - EXISTIERT BEREITS - - - - - - - -');
                            message = `eventId '${event._id}' existiert bereits.`;
                        }
                    });
                    return message ? { message } : null;
                }
            },
            {
                mainHeadline: 'Erstelle Event - Zeitangabe',
                mainP: 'Wann wird das Event stattfinden? Mögliche Formate für die Zeitangabe sind: <ul><li>DD.MM.YYYY</li><li>DD.MM.YYYY hh</li><li>DD.MM.YYYY hh:mm</li><li>DD.MM.YYYY hh:mm:ss</li></ul> Beispiele: <ul><li>17.07.2021 -> entspricht 17. Juli 2021</li><li>17.07.2021 17 -> entspricht 17.Juli 2021 um 17 Uhr</li><li>17.07.2021 17:05 -> entspricht 17. Juli 2021 um 17:05 Uhr</li><li>17.07.2021 17:05:12 -> entspricht 17. Juli 2021 um 17:05:12 Uhr</li></ul>',
                previewContent: function (setup) {
                    let object = convertStringToObject(setup.data);

                    return `
    <div class="event-div">
    <div id="preview-photo-1" class="event-photo"></div>
    <h4 id="preview-headline">${object.displayName}</h4>
    <p id="preview-p">
        <strong><span id="preview-date">01.01.2000</span></strong><br><span id="preview-description">EVENTBESCHREIBUNG</span>
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
                    console.log(convertToDate(userInput.value));

                    let message = '';
                    if (isNaN(convertToDate(userInput.value))) {
                        message = `'${userInput.value}' konnte in kein Datum umgewandelt werden.`;
                    }
                    return message ? { message } : null;
                }
            },
            {
                mainHeadline: 'Erstelle Event - Beschreibung',
                mainP: 'Auf der Website wird für jedes Event eine kurze Beschreibung angegeben. Diese sollte erklären, warum beziehungsweise was gefeiert wird. Bitte gib eine Beschreibung an:',
                previewContent: function (setup) {
                    let object = convertStringToObject(setup.data);
                    const fullDateString = object.dateAsString + (object.dateAsString.split(' ')[1] ? ' Uhr' : '');

                    return `
    <div class="event-div">
    <div id="preview-photo-1" class="event-photo"></div>
    <h4 id="preview-headline">${object.displayName}</h4>
    <p id="preview-p">
        <strong><span id="preview-date">${fullDateString}</span></strong><br><span id="preview-description">EVENTBESCHREIBUNG</span>
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
                mainHeadline: 'Erstelle Event - Sichtbarkeit',
                mainP: 'Soll das Event auf der Website sichtbar sein oder soll es zunächst unsichtbar sein. Wenn ein Event auf unsichtbar gestellt ist, dann ist dieses auf der Website nicht zu sehen und es können auch keine Anmeldungen für dieses Event durchgeführt werden',
                previewContent: function (setup) {
                    let object = convertStringToObject(setup.data);
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
                        checked: [true, false]
                    }
                ]
            }
        ]
    };
};
