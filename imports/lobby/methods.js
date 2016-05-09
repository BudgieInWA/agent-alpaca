import _ from 'lodash';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import Lobbies from './collection.js';

// TODO wrap up methods so you need to reference them.
Meteor.methods({
    'lobby.join': function(id) {
        check(id, String);
        if (!this.userId) {
            throw new Meteor.Error('not-logged-in', "Cannot join a lobby while not logged in.");
        }

        const lobby = Lobbies.findOne({ _id: id });
        if (!lobby) {
            throw new Meteor.Error('lobby-not-found', "Cannot find the lobby to join.");
        }

        if (_.includes(lobby.userIds, Meteor.userId())) {
            throw new Meteor.Error('lobby-already-joined',
                    "Cannot join a lobby that you are already in.");
        }

        return !!Lobbies.update(
            { _id: id },
            {
                $push: {
                    userIds: this.userId,
                },
            }
        );
    },

    'lobby.leave': function(id) {
        check(id, String);
        if (!this.userId) {
            throw new Meteor.Error('not-logged-in', "Cannot leave a lobby while not logged in.");
        }

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
});