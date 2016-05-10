import _ from 'lodash';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { simpleSchemaMixin as SimpleSchemaMixin } from 'meteor/rlivingston:simple-schema-mixin';
import { LoggedInMixin } from 'meteor/tunifight:loggedin-mixin';

import { clueSchema } from './schema.js'
import Games from './collection.js';

let things;
if (Meteor.isServer) {
    things = require('/imports/things').default;
}

function checkInGame(game, playerId) {
    if (!game) {
        throw new Meteor.Error('game-not-found', "Cannot find the game.");
    }
    if (_.includes(game.players.red, playerId)) return 'red';
    if (_.includes(game.players.blue, playerId)) return 'blue';

    throw new Meteor.Error('not-in-game', "Must be in a game to make a move.");
}

function makeBoard({ rows = 5, columns = 5, numBlue = 8, numRed = 9, numBlack = 1 }) {
    if (Meteor.isClient) return [[]];

    const numCards = rows * columns;
    const numGrey = numCards - numBlue - numRed - numBlack;
    const cards = _([])
        .concat(_.times(numRed,   _.constant('red')))
        .concat(_.times(numBlue,  _.constant('blue')))
        .concat(_.times(numBlack, _.constant('black')))
        .concat(_.times(numGrey,  _.constant('grey')))
        .map(colour => ({
            colour,
            word: things.noun({}),
        }))
        .shuffle()
        .value();

    const board = [];
    for (let r = 0; r < rows; r++) {
        board[r] = cards.slice(r * columns, (r + 1) * columns);
    }
    return board;
}

export default {
    startRound: new ValidatedMethod({
        name: 'game.startRound',
        mixins: [SimpleSchemaMixin, LoggedInMixin],
        checkLoggedInError: {
            error: 'not-logged-in',
            message: "Must be logged in to start a round.",
        },
        schema: {
            id: { type: String },
        },
        run: function ({ id }) {
            const game = Games.findOne(id);
            checkInGame(game, this.userId);

            if (game.round) {
                throw new Meteor.Error('round-in-progress', "Cannot start a round during a round");
            }
            // TODO additional rounds

            const round = {
                number: 1,
                spymasters: {
                    red: game.players.red[0],
                    blue: game.players.blue[0],
                },
                board: makeBoard({}),
            };

            Games.update( id, { $set: { round } }, {filter: false});
        }
    }),

    nextTurn: new ValidatedMethod({
        name: 'game.nextTurn',
        mixins: [SimpleSchemaMixin, LoggedInMixin],
        checkLoggedInError: {
            error: 'not-logged-in',
            message: "Must be logged in to start a turn.",
        },
        schema: {
            id: { type: String },
        },
        run: function ({ id }) {
            const game = Games.findOne(id);
            const team = checkInGame(game, this.userId);

            if (!game.round) {
                throw new Meteor.Error('not-in-round', "Must be in a round to move.");
            }

            const turn = {
                number: 1,
                team: 'red',
            };
            if (game.round.turn) {
                if (game.round.turn.team !== team) {
                    throw new Meteor.Error('not-your-turn', "Must be your turn to move.");
                }
                if (!game.round.turn.clue) {
                    throw new Meteor.Error('not-your-turn',
                        "Cannot end turn before a clue is given.");
                }

                turn.number = game.round.turn.number + 1;
                turn.team = (game.round.turn.team === 'red' ? 'blue' : 'red');
            }

            Games.update(id, { $set: { 'round.turn': turn } });
        },
    }),

    giveClue: new ValidatedMethod({
        name: 'game.giveClue',
        mixins: [SimpleSchemaMixin, LoggedInMixin],
        checkLoggedInError: {
            error: 'not-logged-in',
            message: "Must be logged in to give a clue.",
        },
        schema: {
            id: { type: String },
            clue: { type: clueSchema },
        },
        run: function ({ id, clue } ) {
            const game = Games.findOne(id);
            const team = checkInGame(game, this.userId);

            if (!game.round) {
                throw new Meteor.Error('not-in-round', "Must be in a round to move.");
            }
            if (!game.round.turn || game.round.turn.team !== team) {
                throw new Meteor.Error('not-your-turn', "Must be your turn to move.");
            }
            if (!game.round.spymasters[team] === this.userId) {
                throw new Meteor.Error('not-spymaster', "Must be Spymaster to give a clue.");
            }
            if (game.round.turn.clue) {
                throw new Meteor.Error('clue-already-given',
                    "Cannot give more than one clue a turn.");
            }

            return Games.update(id, { $set: { 'round.turn.clue': clue } });
        }
    }),
}
