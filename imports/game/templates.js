import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';

import messages from '/imports/messages';

import schema from './schema.js';
import Games from './collection.js';
import methods from './methods.js';

import './templates.html';

Template.gameScreen.onCreated(function () {
    this.id = new ReactiveVar(null);
    this.doc = new ReactiveVar(null);
    this.autorun(() => {
        this.id.set(FlowRouter.getParam('id'));
        this.subscribe('game.details', this.id.get());
    });
    this.autorun(() => {
        this.doc.set(Games.findOne({ _id: this.id.get() }))
    });
});

Template.gameScreen.helpers({
    doc() {
        return Template.instance().doc.get();
    },

    canStartRound() {
        const game = Template.instance().doc.get();
        return !game.round;
    }
});

Template.gameScreen.events({
    'click .start-round'(event, template) {
        const id = template.id.get();
        methods.startRound.call({ id }, messages.methodCallback("Start Round"));
    },
});

Template.gameReference.onCreated(function () {
    this.autorun(() => {
        this.subscribe('game.reference', this.data.id);
    });
});
Template.gameReference.helpers({
    name() {
        const game = Games.findOne({ _id: this.id });
        if (game) {
            return game.name;
        } else {
            return "unknown";
        }
    }
});

export default {
    view: 'gameScreen',
    edit: 'gameScreen',
}