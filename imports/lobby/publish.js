import { Meteor } from 'meteor/meteor';

import collection from './collection.js'

Meteor.publish('lobby.list', function() {
    return collection.find(
        { public: true },
        {
            fields: {
                name: 1,
                owner: 1,
            }
        }
    );
});