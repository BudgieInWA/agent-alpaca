import { Meteor } from 'meteor/meteor';
import { ServiceConfiguration } from 'meteor/service-configuration';
import { Accounts } from 'meteor/accounts-base';
import { AccountsMultiple } from 'meteor/brettle:accounts-multiple';

import things from '/imports/things';

Meteor.startup(function() {
    ServiceConfiguration.configurations.upsert(
        { service: 'steam'},
        {
            service: 'steam',
            loginStyle: 'redirect',
            timeout: 10000, // ms
        }
    );

    if (Meteor.settings.google) {
        ServiceConfiguration.configurations.upsert(
            { service: 'google'},
            {
                service: 'google',
                clientId: Meteor.settings.google.clientId,
                secret: Meteor.settings.google.secret,
                loginStyle: 'popup',
            }
        );
    }

    if (Meteor.settings.facebook) {
        ServiceConfiguration.configurations.upsert(
            { service: 'facebook'},
            {
                service: 'facebook',
                clientId: Meteor.settings.facebook.appId,
                secret: Meteor.settings.facebook.secret,
                loginStyle: 'popup',
            }
        );
    }
});


Accounts.onCreateUser(
    /**
     * Called when a new user is about to be created.
     *
     * @param {Object} options - Options for the new user. May come from the client (not trusted).
     * @param {Object} user - The proposed user object.
     * @returns {Object} The user object to be used.
     */
    function(options, user) {
        // (Assuming no accounts-password package:)
        if (!user.services) {
            // This is a guest account created by brettle:accounts-anonymous.
            user.displayName = things.fancyNoun({ letterCase: 'title' });
            //TODO? always add this stuff to the user doc so that if a client manages to log in
            // using an external service without already being logged in to an anonymous account,
            // they get the anonymous stuff anyway?
        } else {
            // This is an account created by someone logging in using a 3rd party service for the
            // first time.
            //
            // If the user is already logged in (usually they will be logged into a guest account)
            // then brettle:accounts-add-service will merge the returned user into the existing user
            // object, losing the returned user._id.
            //TODO pull in details from the 3rd party service.
        }

        return user;
    }
);
