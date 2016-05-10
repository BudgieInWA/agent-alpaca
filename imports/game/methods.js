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

function makeCards({ rows = 5, columns = 5, numBlue = 8, numRed = 9, numBlack = 1 }) {
    if (Meteor.isClient) return [[]];

    const numCards = rows * columns;
    const numGrey = numCards - numBlue - numRed - numBlack;
    return _([])
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

            if (game.round && !game.round.isEnded) {
                throw new Meteor.Error('round-in-progress', "Cannot start a round during a round");
            }

            const round = {
                number: 1,
                spymasters: {
                    red: game.players.red[0],
                    blue: game.players.blue[0],
                },
                cards: makeCards({}),
                isEnded: false,
            };
            if (game.round) {
                round.number = game.round.number + 1;
                _.each(['red', 'blue'], t => {
                    const teammates = game.players[t];
                    const currentIndex = _.findIndex(teammates, this.userId);
                    round.spymasters[t] = teammates[(currentIndex + 1) % teammates.length]
                });
            }

            Games.update( id, { $set: { round } });
        },
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

            if (!game.round || game.round.isEnded) {
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

            if (!game.round || game.round.isEnded) {
                throw new Meteor.Error('not-in-round', "Must be in a round to move.");
            }
            if (!game.round.turn || game.round.turn.team !== team) {
                throw new Meteor.Error('not-your-turn', "Must be your turn to move.");
            }
            if (game.round.spymasters[team] !== this.userId) {
                throw new Meteor.Error('not-spymaster', "Must be Spymaster to give a clue.");
            }
            if (game.round.turn.clue) {
                throw new Meteor.Error('clue-already-given',
                    "Cannot give more than one clue a turn.");
            }

            return Games.update(id, {
                $set: {
                    'round.turn.clue': clue,
                    'round.turn.guessesRemaining': clue.number + 1,
                }
            });
        },
    }),

    makeGuess: new ValidatedMethod({
        name: 'game.makeGuess',
        mixins: [SimpleSchemaMixin, LoggedInMixin],
        checkLoggedInError: {
            error: 'not-logged-in',
            message: "Must be logged in to make a guess.",
        },
        schema: {
            id: { type: String },
            cardIndex: { type: Number, min: 0 },
        },
        run: function ({ id, cardIndex } ) {
            const game = Games.findOne(id);
            const team = checkInGame(game, this.userId);

            if (!game.round || game.round.isEnded) {
                throw new Meteor.Error('not-in-round', "Must be in a round to move.");
            }
            if (!game.round.turn || game.round.turn.team !== team) {
                throw new Meteor.Error('not-your-turn', "Must be your turn to move.");
            }
            if (!game.round.turn.clue) {
                throw new Meteor.Error('no-clue', "Cannot guess without a clue.");
            }
            if (game.round.spymasters[team] === this.userId) {
                throw new Meteor.Error('not-guesser', "The Spymaster cannot guess.");
            }

            if (game.round.turn.guessesRemaining <= 0) {
                throw new Meteor.Error('no-guesses-remaining', "No guesses remaining.")
            }

            if (cardIndex >= game.round.cards.length) {
                throw new Meteor.Error('invalid-card-index', "Invalid card index.")
            }
            const card = game.round.cards[cardIndex];
            if (card.coveringColour) {
                throw new Meteor.Error('card-already-guessed',
                    "Cannot guess a card that has already been guessed.");
            }

            let guessesRemaining = game.round.turn.guessesRemaining;
            if (card.colour === team) {
                guessesRemaining -= 1;
            } else {
                guessesRemaining = 0;
            }

            let isEnded = false;
            let scores = game.scores;
            if (card.colour === 'black') {
                // The guesser just lost the round.
                isEnded = true;
                scores[team === 'red' ? 'blue' : 'red'] += 1;
                console.log(team, "lost");
            } else if (!_.some(game.round.cards, c => c.colour === 'red' && !c.coveringColour)) {
                // Red just won.
                isEnded = true;
                scores.red += 1;
                console.log("red won");
            } else if (!_.some(game.round.cards, c => c.colour === 'blue' && !c.coveringColour)) {
                // Blue just won.
                isEnded = true;
                scores.blue += 1;
                console.log("blue won");
            }

            Games.update(id, {
                $set: {
                    [`round.cards.${cardIndex}.coveringColour`]: card.colour,
                    'round.turn.guessesRemaining': guessesRemaining,
                    'round.isEnded': isEnded,
                    scores,
                },
            });
        },
    }),

}
