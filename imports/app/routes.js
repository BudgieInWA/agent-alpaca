import { FlowRouter } from 'meteor/kadira:flow-router';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';

import './templates.js' // App template.
import lobbyScreens from '/modules/lobby/templates'; //TODO templates.js?

/** Render a normal screen into the app. */
function renderScreen(template) {
    BlazeLayout.render('app', {screen: template});
}

FlowRouter.route('/lobby/list', {
    action(params, queryParams) {
        renderScreen(lobbyScreens.list);
    }
});

FlowRouter.route('/lobby/:id', {
    action(params, queryParams) {
        renderScreen(lobbyScreens.list);
    }
});
