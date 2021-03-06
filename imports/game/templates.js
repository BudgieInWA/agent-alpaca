import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';

import messages from '/imports/messages';

import schema from './schema';
import { Games } from './collections';
import methods from './methods';

import './templates.html';

Template.gameScreen.onCreated(function () {
    this.id = new ReactiveVar(null);
    this.doc = new ReactiveVar(null);
    this.autorun(() => {
        this.id.set(FlowRouter.getParam('id'));
        this.subscribe('game.details.spymaster', this.id.get()); // This will provide the full
        // doc when needed. The doc from the other sub might replace it sometimes though.
        this.subscribe('game.details.notSpymaster', this.id.get());
    });
    this.autorun(() => {
        this.doc.set(Games.findOne(this.id.get()));
        console.log(this.doc.get());
    });
});

Template.gameScreen.helpers({
    doc() {
        return Template.instance().doc.get();
    },
});


Template.gameDetails.onCreated(function() {
    this.team = new ReactiveVar(null); // TODO? whole team instead of colour?
    this.autorun(() => {
        const game = Template.currentData(); // For reactivity.
        if (game && game.teams) {
            _.each(game.teams, team => {
                if (_.includes(team.playerIds, Meteor.userId())) {
                    this.team.set(team.colour);
                }
            });
        }
    });
});

Template.gameDetails.helpers({
    isSpymaster(userId) {
        const game = this;
        return game && game.round &&
            _.some(game.round.teams, t => t.spymasterId === userId);
    },
    cardsRemaining(colour) {
        const game = this;
        if (game && game.round && game.round.teams) {
            const teamRound = _.find(game.round.teams, { colour });
            if (!teamRound) {
                console.error("Cannot ask for cards remaining for non-team colour:", colour);
            } else {
                return teamRound.cardsRemaining;
            }
        }
    },

    myTurn() {
        const game = this;
        const team = Template.instance().team.get();
        return game && game.round && game.round.turn &&
                game.round.turn.team === team;

    },

    canStartRound() {
        const game = this;
        return !game.round || game.round.isEnded;
    },

    canNextTurn() {
        const game = this;
        const team = Template.instance().team.get();
        if (!game.round || game.round.isEnded) return false;
        if (!game.round.turn) return true;
        if (!game.round.turn.clue) return false;
        return game.round.turn.team === team;
    },

    canGiveClue() {
        const game = this;
        const teamColour = Template.instance().team.get();
        if (!game.round || game.round.isEnded) return false;
        if (!game.round.turn) return false;
        if (game.round.turn.team !== teamColour) return false;
        const team = _.find(game.round.teams, { colour: teamColour });
        return team.spymasterId === Meteor.userId();
    },

    canGuess() {
        const game = this;
        const teamColour = Template.instance().team.get();
        if (!game.round || game.round.isEnded) return false;
        if (!game.round.turn || game.round.turn.team !== teamColour) return false;
        if (!game.round.turn.clue) return false;
        const team = _.find(game.round.teams, { colour: teamColour });
        if (team.spymasterId === Meteor.userId()) return false;
        return game.round.turn.guessesRemaining >= 0;
    },
});

Template.gameDetails.events({
    'click .start-round, click .next-round'(event, template) {
        const id = template.data._id;
        methods.startRound.call({ id }, messages.methodCallback("Start Round"));
    },

    'click .start-turn, click .next-turn'(event, template) {
        const id = template.data._id;
        methods.nextTurn.call({ id }, messages.methodCallback("Next Turn"));
    },

    'submit .clue-form'(event, template) {
        event.preventDefault();
        const form = event.currentTarget;
        const id = template.data._id;
        const vals = $(form).serializeArray();
        const clue = _.fromPairs(_.map(vals, o => [o.name, o.value])); // Names are unique.
        methods.giveClue.call({ id, clue }, messages.methodCallback("Give Clue"));
    },

    'click .guessing .card'(event, template) {
        const id = template.data._id;
        const cardIndex = event.currentTarget.dataset.index;
        methods.makeGuess.call({ id, cardIndex }, messages.methodCallback("Make Guess"));
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