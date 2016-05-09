import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';

import messages from '/imports/messages';

import schema from './schema.js';
import collection from './collection.js';
import './methods.js';

import './templates.html';

Template.lobbyScreen.onCreated(function () {
    this.subscribe('lobby.list');
});

Template.lobbyScreen.helpers({
    counter() {
    },
});


Template.lobbyListScreen.events({
    'click .create-lobby'(event, template) {
        console.log("hi")
        Meteor.call('lobby.create', function(err, res) {
            if (err) {
                messages.error("Couldn't create new lobby: " + err);
            } else {
                messages.info("New lobby created!");
            }
        });
    },
});

export default {
    view: 'lobbyScreen',
    edit: 'lobbyScreen',
    list: 'lobbyListScreen',
}