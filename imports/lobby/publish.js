import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import Lobbies from './collection.js'

Meteor.publish('lobby.details', function(id) {
    check(id, String);

    return Lobbies.find(
        { _id: id },
        {
            fields: { },
        }
    );
});

Meteor.publish('lobby.list.public', function() {
    return Lobbies.find(
        {
            isPublic: true,
            gameId: null, // "open" lobbies.
        },
        {
            fields: {
                name: 1,
                owner: 1,
            },
        }
    );
});

Meteor.publish('lobby.list.my', function() {
    if (!this.userId) return this.ready();

    return Lobbies.find(
        { ownerId: this.userId },
        {
            fields: {
                name: 1,
                owner: 1,
            }
        }
    );
});
