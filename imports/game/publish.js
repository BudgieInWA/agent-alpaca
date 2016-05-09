import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import Games from './collection.js'

Meteor.publish('game.reference', function(id) {
    check(id, String);

    return Games.find(id, { fields: { name: 1 } });
});
