import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import collection from './collection.js'

Meteor.publish('lobby.details', function(id) {
    check(id, String);

    return collection.find(
        { _id: id },
        {
            fields: { },
        }
    );
});

Meteor.publish('lobby.list.public', function() {
    return collection.find(
        { public: true },
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

    return collection.find(
        { ownerId: this.userId },
        {
            fields: {
                name: 1,
                owner: 1,
            }
        }
    );
});
