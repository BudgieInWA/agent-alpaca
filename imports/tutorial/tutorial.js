import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
//import { ReactiveVar } from 'meteor/???'; // TODO here and everywhere

import { clueSchema } from '/imports/game/schema';

import './tutorial.html';

Template.intro.onCreated(function() {
    Session.setDefault('intro.showBasics', false);
});

Template.intro.helpers({
    showBasics() {
        return Session.get('intro.showBasics');
    },
});


Template.introClue.onCreated(function() {
    _.each(_.range(3), i => {
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
        return _.map([
            { coveringColour: 'grey', word: 'Jen' },
            { coveringColour: 'blue', word: 'Alpaca' },
            { coveringColour: 'grey', word: 'Joe' },
        ], (c, i) => {
            if (!Session.get(`intro.cardRevealed.${i}`)) delete c.coveringColour;
            return c;
        });
    },
});

Template.introClue.events({
   'click .card'(event, template) {
       console.log('click .card')
       const card = event.currentTarget;
       const index = card.dataset.index;
       Session.set(`intro.cardRevealed.${index}`, true);
       if (index === '1') { // Alpaca
           setTimeout(() => FlowRouter.go('/lobby/list'), 3000);
           //TODO show the pic for a bit.
       }
       else { // Civilian
           Session.set('intro.showBasics', true);
       }
   }
});

const correctClue = '???';
Template.introGiveClue.onCreated(function() {
    this.answerGiven = new ReactiveVar(false);
    this.clueCorrect = new ReactiveVar(false);
});

Template.introGiveClue.helpers({
    spymasterCards() {
        return [
            { colour: 'grey', word: 'a' },
            { colour: 'grey', word: 'a' },
            { colour: 'red', word: 'a' },
            { colour: 'red', word: 'a' },
            { colour: 'blue', word: 'a' },
            { colour: 'blue', word: 'a' },
            { colour: 'black', word: 'a' },
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
            template.clueCorrect.set(true);
        }
    }

});
