import { FlowRouter } from 'meteor/kadira:flow-router';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';

import './templates.js' // App template.
import lobbyScreens from '/imports/lobby/templates'; //TODO templates.js?


/** Render a normal screen into the app. */
function renderScreen(template) {
    BlazeLayout.render('app', {screen: template});
}

BlazeLayout.setRoot('body');

FlowRouter.route('/', {
    action(params, queryParams) {
        FlowRouter.go('/lobby/list', params, queryParams);
    }
});


FlowRouter.route('/lobby/list', {
    action(params, queryParams) {
        renderScreen('lobbyListScreen');
    }
});

FlowRouter.route('/lobby/:id', {
    action(params, queryParams) {
        renderScreen('lobbyScreen');
    }
});
