import { Meteor } from 'meteor/meteor';

import messages from '/imports/messages';

import './templates';

Meteor.startup(function() {
    if (Meteor.userId()) {
        messages.info("Welcome back!");
    }

    // Make sure everybody is "logged in".
    Tracker.autorun(function() {
        if (!Meteor.userId()) {
            AccountsAnonymous.login(() => {
                messages.info("Welcome to Agent Alpaca!");
            });
        }
    });
});
