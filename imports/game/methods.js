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

function getGame(id, playerId) {
    const game = Games.findOne({
        _id: id,
        'teams.playerIds': playerId,
    });
    if (!game) {
        throw new Meteor.Error('game-not-found', "Cannot find the game.");
    }
    return game;
}
function getTeam(game, playerId) {
    return _.find(game.teams, t => _.includes(t.playerIds, playerId));
}

function makeCards({ numCards = 25, numRed = 9, numBlue = 9, numBlack = 1 }) {
    if (Meteor.isClient) return [];

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
            const game = getGame(id, this.userId);
            const teams = _.keyBy(game.teams, 'colour');

            if (game.round && !game.round.isEnded) {
                throw new Meteor.Error('round-in-progress', "Cannot start a round during a round");
            }

            const numRed = 1;
            const numBlue = 1;
            const numCards = 1;
            const round = {
                number: 1,
                teams: [
                    {
                        colour: 'red',
                        spymasterId: teams.red.playerIds[0],
                        cardsRemaining: numRed,
                    },
                    {
                        colour: 'blue',
                        spymasterId: teams.blue.playerIds[0],
                        cardsRemaining: numBlue,
                    },
                ],
                cards: makeCards({ numCards, numRed, numBlue, }),
                isEnded: false,
            };
            if (game.round) {
                round.number = game.round.number + 1;
                // Change spymasters.
                _.each(round.teams, team => {
                    const players = teams[team.colour].playerIds;
                    const currentIndex = _.findIndex(players, team.spymasterId);
                    team.spymasterId = players[(currentIndex + 1) % players.length];
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
            const game = getGame(id, this.userId);

            if (!game.round || game.round.isEnded) {
                throw new Meteor.Error('not-in-round', "Must be in a round to move.");
            }

            const team = getTeam(game, this.userId);

            const nextTurn = {
                number: 1,
                team: 'red', // XXX normal game type.
            };
            if (game.round.turn) {
                if (game.round.turn.team !== team.colour) {
                    throw new Meteor.Error('not-your-turn', "Must be your turn to move.");
                }
                if (!game.round.turn.clue) {
                    throw new Meteor.Error('not-your-turn',
                        "Cannot end turn before a clue is given.");
                }

                nextTurn.number = game.round.turn.number + 1;
                nextTurn.team = (game.round.turn.team === 'red' ? 'blue' : 'red'); // XXX normal game type.
            }

            Games.update(id, { $set: { 'round.turn': nextTurn } });
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
            const game = getGame(id, this.userId);

            if (!game.round || game.round.isEnded) {
                throw new Meteor.Error('not-in-round', "Must be in a round to move.");
            }

            const team = getTeam(game, this.userId);

            if (!game.round.turn || game.round.turn.team !== team.colour) {
                throw new Meteor.Error('not-your-turn', "Must be your turn to move.");
            }

            const teamRound = _.find(game.round.teams, { colour: team.colour });
            if (teamRound.spymasterId !== this.userId) {
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
            const game = getGame(id, this.userId);

            if (!game.round || game.round.isEnded) {
                throw new Meteor.Error('not-in-round', "Must be in a round to move.");
            }

            const team = getTeam(game, this.userId);

            if (!game.round.turn || game.round.turn.team !== team.colour) {
                throw new Meteor.Error('not-your-turn', "Must be your turn to move.");
            }
            if (!game.round.turn.clue) {
                throw new Meteor.Error('no-clue', "Cannot guess without a clue.");
            }
            if (team.spymasterId === this.userId) {
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

            // Cover the card.
            card.coveringColour = card.colour;

            // Update remaining guesses and see if someone won.
            const teamsByColour = _.keyBy(game.teams, 'colour');
            if (card.colour === team.colour) {
                game.round.turn.guessesRemaining -= 1;
            } else {
                game.round.turn.guessesRemaining = 0;
            }

            if (card.colour === 'black') {
                // The guesser just lost the round.
                game.round.isEnded = true;
                teamsByColour[team.colour].score -= 1;
                console.log(team.colour, "lost");
            } else if (card.colour === 'grey') {
                // No one can win.
            } else {
                _.each(game.teams, t => {
                    if (!_.some(game.round.cards, c => c.colour === t.colour && !c.coveringColour)) {
                        game.round.isEnded = true;
                        teamsByColour[t.colour].score += 1;
                        console.log(t.colour, "won");
                    }
                });
            }

            Games.update(id, { $set: game });
        },
    }),

}
