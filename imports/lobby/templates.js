import { Template } from 'meteor/templating';

import schema from './schema.js';
import collection from './collection.js';
//import methods from './methods.js';

import './templates.html';

Template.lobbyScreen.onCreated(function () {
});

Template.lobbyScreen.helpers({
    counter() {
    },
});

Template.lobbyScreen.events({
    'click button'(event, template) {
    },
});

export default {
    view: Template.lobbyScreen,
    edit: Template.lobbyScreen,
    list: Template.lobbyListScreen,
}