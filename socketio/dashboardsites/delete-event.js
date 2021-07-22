const Event = require('../../models/event');
const { convertStringToObject, combineStringObjectArray } = require('../../functions/object');
const { deleteFile } = require('../../functions/uploader');
const { ROOT_DIRECTORY, UPLOAD_DIRECTORY } = require('../../config');

module.exports = async function () {
    let eventArray = await Event.find();
    return {
        finishSetupFunction: async function (setup) {
            let data = convertStringToObject(setup.data);
            let selectedEvent = await Event.findById(data.eventId);
            // console.log(data.eventId);
            // console.log(selectedEvent);
            if (selectedEvent) {
                await selectedEvent.remove();
                // console.log('- - - - - - SELECTED EVENT - - - - - - - -');
                // console.log(selectedEvent);

                deleteFile(`${ROOT_DIRECTORY}/${UPLOAD_DIRECTORY}/${data.eventId}-256-144.png`);
                deleteFile(`${ROOT_DIRECTORY}/${UPLOAD_DIRECTORY}/${data.eventId}-256-144.webp`);
                deleteFile(`${ROOT_DIRECTORY}/${UPLOAD_DIRECTORY}/${data.eventId}-512-288.png`);
                deleteFile(`${ROOT_DIRECTORY}/${UPLOAD_DIRECTORY}/${data.eventId}-512-288.webp`);

                deleteFile(`${ROOT_DIRECTORY}/${UPLOAD_DIRECTORY}/${data.eventId}-400-525.png`);
                deleteFile(`${ROOT_DIRECTORY}/${UPLOAD_DIRECTORY}/${data.eventId}-400-525.webp`);
                deleteFile(`${ROOT_DIRECTORY}/${UPLOAD_DIRECTORY}/${data.eventId}-800-1050.png`);
                deleteFile(`${ROOT_DIRECTORY}/${UPLOAD_DIRECTORY}/${data.eventId}-800-1050.webp`);

                return {
                    mainHeadline: 'Setup abgeschlossen',
                    mainP: 'Event erfolgreich gelöscht.',
                    mainButtonSection: '',
                    mainPercentage: '100%',
                    previewContent: `
                    <div class="event-div">
                    <div id="preview-photo-1" class="event-photo"></div>
                    <h4 id="preview-headline">${selectedEvent.displayName}</h4>
                    <p id="preview-p">
                        <strong><span id="preview-date">${
                            selectedEvent.dateAsString + (selectedEvent?.dateAsString?.split(' ')[1] ? ' Uhr' : '')
                        }</span></strong><br><span id="preview-description">${selectedEvent.description}</span>
                    </p>
                    <button>Jetzt anmelden</button>
                    </div>
                    `
                };
            }
            return {
                mainHeadline: 'Setup abgebrochen',
                mainP: 'Event konnte nicht gelöscht werden.',
                mainButtonSection: '',
                mainPercentage: '100%',
                previewContent: '<p class="no-preview-p">Derzeit steht keine Vorschau zur Verfügung.</p>'
            };
        },
        steps: [
            {
                mainHeadline: 'Lösche Event - Auswahl des Events',
                mainP: 'Welches Event soll gelöscht werden?',
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

                            eventArray?.forEach((event) => {
                                array.push(event._id);
                            });
                            return array;
                        }
                    }
                ]
            },
            {
                mainHeadline: 'Lösche Event - Wirklich löschen?',
                mainP: 'Soll das Event wirklich gelöscht werden?',
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
                        type: 'radio',
                        id: 'confirm',
                        name: 'Wirklich löschen?',
                        values: ['Ja', 'Nein'],
                        checked: [false, true]
                    }
                ],
                validate: function (userInput) {
                    if (userInput?.id !== 'confirm') {
                        return { message: "userInput.id muss 'confirm' entsprechen." };
                    }

                    // console.log('- - - - - - VALIDATE - DELETE CONFIG - - - - - -');
                    // console.log(userInput);

                    let message = '';
                    if (userInput?.value?.toLowerCase() !== 'ja') {
                        message = `'Wirklich löschen' muss 'Ja' entsprechen. Klicke auf Abbrechen, falls das Event nicht gelöscht werden soll.`;
                    }
                    return message ? { message } : null;
                }
            }
        ]
    };
};
