import { SimpleSchema } from 'meteor/aldeed:simple-schema';

export default new SimpleSchema({
    name: {
        label: "Name",
        type: String,
    },

    ownerId: {
        label: "Owner",
        type: String,
    },

    isPublic: {
        label: "Public?",
        type: Boolean,
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