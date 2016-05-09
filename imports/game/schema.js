import { SimpleSchema } from 'meteor/aldeed:simple-schema';

export const turn = new SimpleSchema({
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
        type: Object,
    },
    'clue.word': {
        label: "Word",
        type: String,
    },
    'clue.number': {
        label: "Number",
        type: Number,
    },

    guessesRemaining: {
        label: "Guesses Remaining",
        type: Number,
    },
});

export const round = new SimpleSchema({
    number: {
        label: "Round #",
        type: Number,
    },

    spymasters: {
        label: "Spymasters",
        type: Object,
    },
    'spymasters.redPlayerId': {
        label: "Red Spymaster",
        type: String,
    },
    'spymasters.bluePlayerId': {
        label: "Blue Spymaster",
        type: String,
    },

    board: {
        label: "Board",
        type: [[Object]],
    },
    'board.$.$.word': {
        label: "Word",
        type: String,
    },
    'board.$.$.colour': { // spymaster secret
        label: "Word",
        type: String,
    },
    'board.$.$.coveringColour': {
        label: "Covering Colour",
        type: String,
        optional: true,
    },

    turn: {
        label: "Current Turn",
        type: turn,
    }
});

export default new SimpleSchema({
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

    round: {
        label: "Current Round",
        type: round,
    }
})