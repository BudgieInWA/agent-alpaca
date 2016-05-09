import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { simpleSchemaMixin as SimpleSchemaMixin } from 'meteor/rlivingston:simple-schema-mixin';
import { LoggedInMixin } from 'meteor/tunifight:loggedin-mixin';

import Games from './collection.js';

export default {
    create: new ValidatedMethod({
        name: 'game.create',
        mixins: [SimpleSchemaMixin, LoggedInMixin],
        checkLoggedInError: {
            error: 'not-logged-in',
            message: "Must be logged in to create a game.",
        },
        schema: {
            players: {type: String},
        },
        run: function ({ id, gameId }) {

        }
    }),
}
