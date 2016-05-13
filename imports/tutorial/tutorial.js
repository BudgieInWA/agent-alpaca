import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
//import { ReactiveVar } from 'meteor/???'; // TODO here and everywhere

import { clueSchema } from '/imports/game/schema';

import './tutorial.html';

const introCards = [
    { coveringColour: 'grey', word: 'Jen' },
    { coveringColour: 'blue', word: 'Alpaca' },
    { coveringColour: 'grey', word: 'Joe' },
];


Template.intro.onCreated(function() {
    Session.setDefault('intro.chosenCivilian', null);
});

Template.intro.helpers({
    showBasics() {
        return !!Session.get('intro.chosenCivilian');
    },
    chosenCivilian() {
        return Session.get('intro.chosenCivilian');
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
       if (introCards[index].coveringColour === 'blue') { // Alpaca
           setTimeout(() => FlowRouter.go('/lobby/list'), 3000);
           //TODO show the pic for a bit.
       }
       else { // Civilian
           Session.set('intro.chosenCivilian', introCards[index].word);
       }
   }
});

const correctClue = 'nine';
Template.introGiveClue.onCreated(function() {
    this.answerGiven = new ReactiveVar(false);
    this.clueCorrect = new ReactiveVar(false);
});

Template.introGiveClue.helpers({
    spymasterCards() {
        return [
            { colour: 'black', word: 'arrow' },
            { colour: 'grey',  word: 'debt' },
            { colour: 'red',   word: 'cell' },
            { colour: 'blue',  word: 'number' },
            { colour: 'red',   word: 'orange' },
            { colour: 'grey',  word: 'dog' },
            { colour: 'blue',  word: 'cat' },
        ];
    },

    showResult() {
        return Template.instance().answerGiven.get();
    },
    clueCorrect() {
        return Template.instance().clueCorrect.get();
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
        const clue = _.fromPairs(_.map(vals, o => [o.name, o.value])); // Names are unique.
        //if (clueSchema.validate) // TODO

        template.answerGiven.set(true);
        if (clue.word.toLowerCase() === correctClue && clue.number === '2') {
            // TODO set the actual clue to have it displayed.
            template.clueCorrect.set(true);
        }
    }

});
