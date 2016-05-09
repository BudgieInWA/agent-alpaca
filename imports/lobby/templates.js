import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import { FlowRouter } from 'meteor/kadira:flow-router';

import messages from '/imports/messages';

import schema from './schema.js';
import collection from './collection.js';
import './methods.js';

import './templates.html';

Template.lobbyScreen.onCreated(function () {
    this.id = new ReactiveVar(null);
    this.autorun(() => {
        this.id.set(FlowRouter.getParam('id'));
        this.subscribe('lobby.details', this.id.get());
    })
});

Template.lobbyScreen.helpers({
    doc() {
        const id = Template.instance().id.get();
        return collection.findOne({ _id: id });
    },
});


Template.lobbyListScreen.onCreated(function () {
    this.subscribe('lobby.list.public');
});

Template.lobbyListScreen.helpers({
    lobbies() {
        return collection.find();
    },
});

Template.lobbyListScreen.events({
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

export default {
    view: 'lobbyScreen',
    edit: 'lobbyScreen',
    list: 'lobbyListScreen',
}