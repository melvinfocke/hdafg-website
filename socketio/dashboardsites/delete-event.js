const Event = require('../../models/event');
const { convertStringToObject } = require('../../functions/object');

module.exports = async function () {
    let eventArray = await Event.find();
    return {
        finishSetupFunction: async function (setup) {
            let data = convertStringToObject(setup.data);
            let selectedEvent = await Event.findById(data.eventId);
            console.log(data.eventId);
            console.log(selectedEvent);
            if (selectedEvent) {
                await selectedEvent.remove();
                console.log('- - - - - - SELECTED EVENT - - - - - - - -');
                console.log(selectedEvent);
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
                previewContent: '<p class="no-preview-p">Derzeit steht keine Vorschau zur Verfügung.</p>',
                inputs: [
                    {
                        type: 'select',
                        id: 'eventId',
                        name: 'Event-ID',
                        values: function (setup) {
                            let array = [''];

                            eventArray?.forEach((event) => {
                                array.push(event._id);
                            });
                            return array;
                        }
                    }
                ]
            }
        ]
    };
};
