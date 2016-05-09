import { SimpleSchema } from 'meteor/aldeed:simple-schema';

export default new SimpleSchema({
    ownerId: {
        label: "Owner",
        type: String,
    },

    userIds: {
        label: "Players",
        type: [String],
        defaultValue: [],
    },

    gameId: {
        label: "Games",
        type: String,
        optional: true,
    },
})