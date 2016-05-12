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

export const roundTeamSchema = new SimpleSchema({
    colour: {
        label: "Colour",
        type: String,
    },
    spymasterId: {
        label: "Spymaster",
        type: String,
    },
    cardsRemaining: {
        label: "Cards Remaining",
        type: Number,
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

    teams: {
        label: "Teams",
        type: [roundTeamSchema],
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

export const teamSchema = new SimpleSchema({
    colour: {
        label: "Colour",
        type: String,
    },
    playerIds: {
        label: "Players",
        type: [String],
    },
    score: {
        label: "Score",
        type: Number,
        defaultValue: 0,
    },
});

export default new SimpleSchema({
    name: {
        label: "Name",
        type: String,
    },

    teams: {
        label: "Teams",
        type: [teamSchema],
    },

    round: {
        label: "Current Round",
        type: roundSchema,
        optional: true,
    }
})