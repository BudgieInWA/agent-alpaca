import './tutorial.html';

Template.intro.helpers({
    introClue() {
        return {
            word: 'cool',
            number: 1,
        };
    },

    introCards() {
        return [
            { word: 'Jen' },
            { word: 'Alpaca' },
            { word: 'Joe' },
        ];
    },
});

Template.intro.events({
   'click .card'(event, template) {
       const card = event.currentTarget;
       if (card.dataset.index === '1') { // Alpaca
           //TODO show the pic for a bit.
           FlowRouter.go('/lobby/list');
       }
       else { // Civilian
           //TODO show intro tutorial
       }
   }
});