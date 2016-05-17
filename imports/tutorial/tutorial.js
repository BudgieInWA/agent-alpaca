import _ from 'lodash';
import { EJSON } from 'meteor/ejson';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
//import { ReactiveVar } from 'meteor/???'; // TODO here and everywhere

import messages from '/imports/messages';
import { clueSchema } from '/imports/game/schema';

import './tutorial.html';

const introCards = [
    { coveringColour: 'grey', word: 'Jen' },
    { coveringColour: 'blue', word: 'Alpaca' },
    { coveringColour: 'grey', word: 'Joe' },
];


Template.intro.onCreated(function() {
    Session.setDefault('intro.chosenCard', null);
});

Template.intro.helpers({
    showBasics() {
        return !!Session.get('intro.chosenCard');
    },
    chosenCard() {
        return Session.get('intro.chosenCard');
    },
});


Template.introClue.onCreated(function() {
    _.each(introCards, (c, i) => {
        Session.setDefault(`intro.cardRevealed.${i}`, false);
    });
});

Template.introClue.helpers({
    introClue() {
        return {
            word: 'cool',
            number: 1,
        };
    },

    introCards() {
        return _.map(introCards, (c, i) => {
            if (!Session.get(`intro.cardRevealed.${i}`)) {
                return _.omit(c, 'coveringColour');
            } else {
                return c;
            }
        });
    },
});

Template.introClue.events({
   'click .card'(event, template) {
       const card = event.currentTarget;
       const index = card.dataset.index;
       Session.set(`intro.cardRevealed.${index}`, true);
       Session.set('intro.chosenCard', introCards[index]);
   },
});

const spymasterCards = [
    { colour: 'black', word: 'arrow' },
    { colour: 'grey',  word: 'debt' },
    { colour: 'red',   word: 'cell' },
    { colour: 'blue',  word: 'number' },
    { colour: 'red',   word: 'orange' },
    { colour: 'grey',  word: 'dog' },
    { colour: 'blue',  word: 'cat' },
];
const correctClue = { word: 'nine', number: 2 };
Template.introGiveClue.onCreated(function() {
    this.clueGiven = new ReactiveVar(null);
});

Template.introGiveClue.helpers({
    spymasterCards() {
        return spymasterCards;
    },

    clueGiven() {
        return Template.instance().clueGiven.get();
    },
    clueCorrect() {
        return _.isEqual(Template.instance().clueGiven.get(), correctClue);
    },
    correctClue() {
        return correctClue;
    },
});

Template.introGiveClue.events({
    'submit .clue-form'(event, template) {
        event.preventDefault();
        const form = event.currentTarget;
        const vals = $(form).serializeArray();
        // Names are unique:
        const clue = clueSchema.clean(_.fromPairs(_.map(vals, o => [o.name, o.value])));

        const validationContext = clueSchema.newContext();
        if (validationContext.validate(clue)) {
            template.clueGiven.set(clue);
        } else {
            messages.error("There's a problem in that" +
                EJSON.stringify(validationContext.errorObject()));
        }

    }

});
