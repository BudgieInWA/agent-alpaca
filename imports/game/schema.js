import { SimpleSchema } from 'meteor/aldeed:simple-schema';

export const clueSchema = new SimpleSchema({
    word: {
        label: "Word",
        type: String,
    },
    number: {
        label: "Number",
        type: Number,
    },
});

export const turnSchema = new SimpleSchema({
    number: {
        label: "Turn #",
        type: Number,
    },

    team: {
        label: "Team",
        type: String,
        allowedValues: ['red', 'blue'],
    },

    clue: {
        label: "Current Clue",
        type: clueSchema,
        optional: true,
    },

    guessesRemaining: {
        label: "Guesses Remaining",
        type: Number,
        optional: true,
    },
});

export const roundSchema = new SimpleSchema({
    number: {
        label: "Round #",
        type: Number,
    },
    isEnded: {
        label: "Ended?",
        type: Boolean,
    },

    spymasters: {
        label: "Spymasters",
        type: Object,
    },
    'spymasters.red': {
        label: "Red Spymaster",
        type: String,
    },
    'spymasters.blue': {
        label: "Blue Spymaster",
        type: String,
    },

    cards: {
        label: "Cards",
        type: [Object],
    },
    'cards.$.word': {
        label: "Word",
        type: String,
    },
    'cards.$.colour': { // spymaster secret
        label: "Allegiance",
        type: String,
    },
    'cards.$.coveringColour': {
        label: "Covering Colour",
        type: String,
        optional: true,
    },

    turn: {
        label: "Current Turn",
        type: turnSchema,
        optional: true,
    }
});

export default new SimpleSchema({
    name: {
        label: "Name",
        type: String,
    },

    players: {
        label: "Players",
        type: Object,
    },

    'players.red': {
        label: "Red Team Players",
        type: [String],
    },
    'players.blue': {
        label: "Blue Team Players",
        type: [String],
    },

    scores: {
        label: "Scores",
        type: Object,
        defaultValue: {'red': 0, 'blue': 0},
    },
    'scores.red': {
        label: "Red Score",
        type: Number,
        min: 0,
    },
    'scores.blue': {
        label: "Blue Score",
        type: Number,
        min: 0,
    },

    round: {
        label: "Current Round",
        type: roundSchema,
        optional: true,
    }
})