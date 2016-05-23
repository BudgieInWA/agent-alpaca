import { Meteor } from 'meteor/meteor';

import messages from '/imports/messages';

// Monkeypatch various meteor bits to change things that are silly.
import './fixMeteor.js';

// Set up routes.
import './routes.js';
// Make components available.
import '/imports/components';

// Trigger each modules entry point.
import '/imports/game/client.js';
import '/imports/lobby/client.js';
import '/imports/tutorial/client.js';

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