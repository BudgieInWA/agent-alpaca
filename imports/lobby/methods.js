import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import Lobbies from './collection.js';

// TODO wrap up methods so you need to reference them.
Meteor.methods({
    'lobby.create': function() {
        if (!this.userId) {
            throw new Meteor.Error('not-logged-in', "Must be logged in to create a lobby.");
        }

        Lobbies.insert({
            owner: this.userId,
            name: "TODO",
        })
    }
});