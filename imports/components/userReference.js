import { Meteor } from 'meteor/meteor';

import './userReference.html';

Template.userReference.onRendered(function() {
    this.subscribe('user.reference', this.data.id);
});

Template.userReference.helpers({
    doc() {
        return Meteor.users.findOne({ _id: this.id });
    },
});
