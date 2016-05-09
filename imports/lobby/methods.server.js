import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import things from '/imports/things';

import Lobbies from './collection.js';

// TODO wrap up methods so you need to reference them.
Meteor.methods({
    'lobby.create': function() {
        if (!this.userId) {
            throw new Meteor.Error('not-logged-in', "Must be logged in to create a lobby.");
        }

        return Lobbies.insert({
            ownerId: this.userId,
            name: "The Congregation for the " + things.fancyNoun({ letterCase: 'title'}),
            userIds: [this.userId],
            public: true,
        });
    }
});