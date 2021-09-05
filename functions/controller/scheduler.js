const schedule = require('node-schedule');
const Event = require('../../models/event');

function scheduler() {
    schedule.scheduleJob('0 0 0 * * *' /* EVERY DAY AT 12:00 AM */, async () => {
        const eventArray = await Event.find({ isVisible: true });
        const dateNow = new Date().getTime();

        eventArray.forEach(async (event) => {
            if (
                event.date + 86445000 >= dateNow /* Is the date less than 24h0m45s ago? */ &&
                event.date + 45000 < dateNow /* Was the event's duration at least 45s? */
            ) {
                event.isVisible = false;
                await event.save();
            }
        });
    });
}

module.exports = scheduler;
