import { SimpleSchema } from 'meteor/aldeed:simple-schema';

export default new SimpleSchema({
    ownerId: {
        type: String,
        label: "Owner",
    },

    userIds: {
        type: [String],
        label: "Players",
    },

    gameId: {
        type: String,
        label: "Games",
    },
})