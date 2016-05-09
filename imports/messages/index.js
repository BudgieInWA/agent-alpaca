
// TODO put this stuff into the UI.

export default {
    error(message, options) {
        console.error(message);
    },

    info(message, options) {
        console.info(message);
    },

    methodCallback(task) {
        return (err, res) => {
            if (err) {
                this.error(`${task} failed :( ${err}`);
                console.error(err);
            } else {
                this.info(`${task} done :) ${res}`);
            }
        }
    }
}
