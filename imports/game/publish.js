import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import { Games } from './collections'

Meteor.publish('game.reference', function(id) {
    check(id, String);

    return Games.find(id, { fields: { name: 1 } });
});

Meteor.publish('game.details.notSpymaster', function(id) {
    check(id, String);

    return Games.find(
        {
            _id: id,
            'teams.playerIds': this.userId,
            'round.teams.spymasterId': { $ne: this.userId },
        },
        { fields: { 'round.cards.colour': 0 } }
    );
});

Meteor.publish('game.details.spymaster', function(id) {
    check(id, String);

    return Games.find(
        {
            _id: id,
            'round.teams.spymasterId': this.userId,
        }
        // If Meteor weren't broken, we'd leave this in and it would be merged with the rest of
        // the fields:
        //{ fields: { 'round.cards.colour': 1 } }
        // As it is, we include all fields and hope that docs from this sub are used over docs from
        // the public sub. See https://github.com/meteor/meteor/issues/3764
    );
});
