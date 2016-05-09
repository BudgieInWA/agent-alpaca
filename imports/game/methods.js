import _ from 'lodash';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { simpleSchemaMixin as SimpleSchemaMixin } from 'meteor/rlivingston:simple-schema-mixin';
import { LoggedInMixin } from 'meteor/tunifight:loggedin-mixin';

import Games from './collection.js';

let things;
if (Meteor.isServer) {
    things = require('/imports/things').default;
}

function checkInGame(game, playerId) {
    if (!game) {
        throw new Meteor.Error('game-not-found', "Cannot find the game.");
    }
    if (!_.includes(game.players.red, playerId) &&
        !_.includes(game.players.blue, playerId)) {
        throw new Meteor.Error('not-in-game', "Must be in a game to make a move.");
    }
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
}
