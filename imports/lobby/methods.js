import _ from 'lodash';
import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { simpleSchemaMixin as SimpleSchemaMixin } from 'meteor/rlivingston:simple-schema-mixin';
import { LoggedInMixin } from 'meteor/tunifight:loggedin-mixin';

import Lobbies from './collection.js';

import Games from '/imports/game/collection.js';

let things;
if (Meteor.isServer) {
    things = require('/imports/things').default;
}

export default {
    create: new ValidatedMethod({
        name: 'lobby.create',
        mixins: [SimpleSchemaMixin, LoggedInMixin],
        checkLoggedInError: {
            error: 'not-logged-in',
            message: "Must be logged in to join a lobby.",
        },
        schema: {},
        run: function() {
            let name = "Your New Lobby";
            if (Meteor.isServer) {
                name = "Battle of the " + things.fancyNoun({ letterCase: 'title'});
            }

            return Lobbies.insert({
                ownerId: this.userId,
                name,
                userIds: [this.userId],
                isPublic: true,
            });
        }
    }),

    join: new ValidatedMethod({
        name: 'lobby.join',
        mixins: [SimpleSchemaMixin, LoggedInMixin],
        checkLoggedInError: {
            error: 'not-logged-in',
            message: "Must be logged in to join a lobby.",
        },
        schema: {
            id: {type: String},
        },
        run: function ({ id }) {
            const lobby = Lobbies.findOne({_id: id});
            if (!lobby) {
                throw new Meteor.Error('lobby-not-found', "Cannot find the lobby to join.");
            }

            if (_.includes(lobby.userIds, Meteor.userId())) {
                throw new Meteor.Error('lobby-already-joined',
                    "Cannot join a lobby that you are already in.");
            }

            return !!Lobbies.update(
                {_id: id},
                {
                    $push: {
                        userIds: this.userId,
                    },
                }
            );
        },
    }),

    leave: new ValidatedMethod({
        name: 'lobby.leave',
        mixins: [SimpleSchemaMixin, LoggedInMixin],
        checkLoggedInError: {
            error: 'not-logged-in',
            message: "Must be logged in to leave a lobby.",
        },
        schema: {
            id: { type: String },
        },
        run: function({ id }) {
            const lobby = Lobbies.findOne({ _id: id });
            if (!lobby) {
                throw new Meteor.Error('lobby-not-found', "Cannot find the lobby to leave.");
            }

            if (!_.includes(lobby.userIds, Meteor.userId())) {
                throw new Meteor.Error('not-in-lobby',
                    "Cannot leave a lobby that you are not in.");
            }

            const modification = {
                $pull: {
                    userIds: this.userId,
                },
            };
            if (lobby.ownerId === this.userId) {
                const newOwner = _.find(lobby.userIds, (id) => id !== this.userId);

                // Delete the lobby if the last person left.
                if (!newOwner) {
                    return !!Lobbies.remove({ _id: id });
                }

                modification.$set = {
                    ownerId: newOwner,
                };
            }

            return !!Lobbies.update(
                { _id: id },
                modification
            );
        }
    }),

    //TODO kick

    startGame: new ValidatedMethod({
        name: 'lobby.startGame',
        mixins: [SimpleSchemaMixin, LoggedInMixin],
        checkLoggedInError: {
            error: 'not-logged-in',
            message: "Must be logged in to start a game.",
        },
        schema: {
            id: { type: String },
        },
        run: function ({ id }) {
            const lobby = Lobbies.findOne({ _id: id });
            if (lobby.ownerId !== this.userId) {
                throw new Meteor.Error('not-lobby-owner', "Must be lobby owner to start the game.");
            }

            if (lobby.userIds.length < 4) {
                throw new Meteor.Error('not-enough-players',
                    "Must have at least 4 players to start a game.");
            }

            // Split players into teams.
            const numPlayers = lobby.userIds.length;
            const game = {
                name: lobby.name,
                teams: [
                    {
                        colour: 'red',
                        playerIds: lobby.userIds.slice(0, Math.floor(numPlayers/2)),
                    },
                    {
                        colour: 'blue',
                        playerIds: lobby.userIds.slice(Math.floor(numPlayers/2)),
                    },
                ],
            };

            const gameId = Games.insert(game);
            Lobbies.update(id, { $set: { gameId } });
            return gameId;
        },
    }),
};