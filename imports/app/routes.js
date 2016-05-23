import { FlowRouter } from 'meteor/kadira:flow-router';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';

import lobbyScreens from '/imports/lobby/templates';
import gameScreens from '/imports/game/templates';


/** Render a normal screen into the app. */
function renderScreen(template) {
    BlazeLayout.render('app', {screen: template});
}

BlazeLayout.setRoot('body');

FlowRouter.route('/', {
    action(params, queryParams) {
        renderScreen('intro');
        //FlowRouter.go('/lobby/list', params, queryParams);
    }
});


FlowRouter.route('/lobby/list', {
    name: 'lobby.list',
    action(params, queryParams) {
        renderScreen(lobbyScreens.list);
    }
});

FlowRouter.route('/lobby/:id', {
    name: 'lobby.view',
    action(params, queryParams) {
        renderScreen(lobbyScreens.view);
    }
});


FlowRouter.route('/game/:id', {
    name: 'game.view',
    action(params, queryParams) {
        renderScreen(gameScreens.view);
    }
});
