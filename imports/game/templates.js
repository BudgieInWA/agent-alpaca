import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';

import messages from '/imports/messages';

import schema from './schema.js';
import collection from './collection.js';
import methods from './methods.js';

import './templates.html';

Template.gameScreen.onCreated(function () {
});

Template.gameScreen.helpers({
    something() {
    },
});

Template.gameScreen.events({
    'click .something'(event, template) {
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