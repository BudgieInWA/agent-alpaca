import _ from 'lodash';
import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import { FlowRouter } from 'meteor/kadira:flow-router';

import messages from '/imports/messages';

import Lobbies from './collection.js';
import methods from './methods.js';

import './templates.html';

Template.lobbyScreen.onCreated(function () {
    this.id = new ReactiveVar(null);
    this.doc = new ReactiveVar(null);
    this.autorun(() => {
        this.id.set(FlowRouter.getParam('id'));
        this.subscribe('lobby.details', this.id.get());
    });
    this.autorun(() => {
        this.doc.set(Lobbies.findOne({ _id: this.id.get() }))
    });
});

Template.lobbyScreen.helpers({
    doc() {
        return Template.instance().doc.get();
    },

    canJoin() {
        const doc = Template.instance().doc.get();
        return !_.includes(doc.userIds, Meteor.userId());
    },
    canLeave() {
        const doc = Template.instance().doc.get();
        return _.includes(doc.userIds, Meteor.userId());
    },
});

Template.lobbyScreen.events({
    'click .join-lobby'() {
        const id = Template.instance().id.get();
        methods.join.call({ id }, function(err, res) {
            if (err) {
                messages.error("Couldn't join lobby: " + err);
            } else {
                messages.info("Joined lobby!");
            }
        });
    },
    'click .leave-lobby'() {
        const id = Template.instance().id.get();
        methods.leave.call({ id }, function (err, res) {
            if (err) {
                messages.error("Couldn't leave lobby: " + err);
            } else {
                messages.info("Left lobby!");
                //FlowRouter.go('lobby.list');
            }
        });
    },
});


Template.lobbyListScreen.onCreated(function () {
    this.subscribe('lobby.list.public');
});

Template.lobbyListScreen.helpers({
    lobbies() {
        return Lobbies.find();
    },
});

Template.lobbyListScreen.events({
    'click .create-lobby'(event, template) {
        methods.create.call(function(err, res) {
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