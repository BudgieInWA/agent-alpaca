import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { LoginState } from 'meteor/brettle:accounts-login-state';

import './userDetails.html';

Template.userDetails.helpers({
    guestUser() {
        if (LoginState.loggedIn() && !LoginState.signedUp()) {
            return Meteor.user();
        }
    },
});