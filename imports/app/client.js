import { Meteor } from 'meteor/meteor';

import messages from '/imports/messages';

// Monkeypatch various meteor bits to change things that are silly.
import './fixMeteor.js';

// Set up routes.
import './routes.js';
// Make components available.
import '/imports/components';

// Trigger each modules entry point.
import '/imports/lobby/client.js';
import '/imports/game/client.js';

Meteor.startup(function() {
    // Make sure everybody is "logged in".
    if (!Meteor.userId()) {
        messages.info("Welcome to Agent Alpaca!");
        AccountsAnonymous.login();
    } else {
        messages.info("Welcome back!");
    }
});