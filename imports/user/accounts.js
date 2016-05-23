import { Meteor } from 'meteor/meteor';
import { ServiceConfiguration } from 'meteor/service-configuration';
import { Accounts } from 'meteor/accounts-base';
import { AccountsMultiple } from 'meteor/brettle:accounts-multiple';
import { AccountsAddService } from 'meteor/brettle:accounts-add-service';

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
                appId: Meteor.settings.facebook.appId,
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
     * If the user is already logged in (usually they will be logged into a guest account) then
     * brettle:accounts-add-service will merge the returned user into the existing user object
     * (dropping the returned user._id in the process).
     *
     * @param {Object} options - Options for the new user. May come from the client (not trusted).
     * @param {Object} user - The proposed user object.
     * @returns {Object} The user object to be used.
     */
    function(options, user) {
        user.profile = {};

        if (!user.services) {
            // New anonymous account.
            user.services = {
                guest: {
                    name: things.fancyNoun({ letterCase: 'title' }),
                },
            };
            user.profile.name = user.services.guest.name;
        }

        return user;
    }
);

AccountsMultiple.register({
    /**
     * Called when a logged in user logs in with a different account, but switching accounts failed.
     *
     * @param attemptingUser - The originally logged in user.
     * @param attempt - The login attempt.
     */
    onSwitchFailure(attemptingUser, attempt) {
        // Only continue if the switch was rejected because `attempt.user` was merged into
        // `attemptingUser`.
        if (!attempt.error ||
            !attempt.error.error || !attempt.error.reason ||
            attempt.error.error !== Accounts.LoginCancelledError.numericError ||
            attempt.error.reason !== AccountsAddService._mergeUserErrorReason) {
            return;
        }

        // Upgrade from guest name if needed.
        if (attemptingUser.profile.name === attemptingUser.services.guest.name) {
            switch(attempt.type) {
                case 'facebook':
                    Meteor.users.update(attemptingUser._id,
                            { $set: { 'profile.name': attempt.user.services.facebook.name } });
                    break;
                case 'google':
                    Meteor.users.update(attemptingUser._id,
                            { $set: { 'profile.name': attempt.user.services.google.name } });
                    break;
                case 'steam':
                    // TODO get name from steam.
                    break;
            }
        }
    }
});


/*
A Google account profile looks like
{
    accessToken: 'some long string',
    idToken: 'some really long string',
    expiresAt: 1464002544504,
    scope: [Object],
    id: '123456789',
    email: 'user@example.com',
    verified_email: true,
    name: 'Joe Bloggs',
    given_name: 'Joe',
    family_name: 'Bloggs',
    picture: 'http://example.com/impage.jpg',
    locale: 'en-GB',
    gender: 'male'
}

{
    accessToken: 'some really long string',
    expiresAt: 1469189417581,
    id: '12345678',
    email: 'user@example.com',
    name: 'Joe Bloggs',
    first_name: 'Joe',
    last_name: 'Bloggs',
    link: 'https://www.facebook.com/app_scoped_user_id/12345678/',
    gender: 'male',
    locale: 'en_US',
    age_range: [Object]
}
 */
