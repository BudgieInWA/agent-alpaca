import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import Games from './collection.js'

Meteor.publish('game.reference', function(id) {
    check(id, String);

    return Games.find(id, { fields: { name: 1 } });
});

Meteor.publish('game.details', function(id) {
    check(id, String);

    return Games.find(
        {
            _id: id,
            $or: [
                { 'players.red' : this.userId },
                { 'players.blue': this.userId },
            ],
        },
        { fields: { 'round.cards.colour': 0 } }
    );
});

Meteor.publish('game.details.spymaster', function(id) {
    check(id, String);

    return Games.find(
        {
            _id: id,
            $or: [
                { 'spymasters.red' : this.userId },
                { 'spymasters.blue': this.userId },
            ],
        },
        { fields: { 'round.cards.colour': 1 } }
    );
});
