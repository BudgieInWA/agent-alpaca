import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';

import messages from '/imports/messages';

import schema from './schema.js';
import collection from './collection.js';
import './methods.js';

import './templates.html';

Template.gameScreen.onCreated(function () {
    this.subscribe('lobby.list.public');
});

Template.gameScreen.helpers({
    lobbies() {
        return collection.find();
    },
});

Template.gameScreen.events({
    'click .create-lobby'(event, template) {
        Meteor.call('lobby.create', function(err, res) {
            if (err) {
                messages.error("Couldn't create new lobby: " + err);
            } else {
                messages.info("New lobby created!");
                FlowRouter.go('lobby.view', {id: res});
            }
        });
    },
});

Template.gameReference.onCreated(function () {
    this.autorun(() => {
        this.subscribe('game.reference', this.data.id);
    });
});
Template.gameReference.helpers({
    name() {
        return collection.findOne({ _id: this.id }).name;
    }
});

export default {
    view: 'gameScreen',
    edit: 'gameScreen',
}