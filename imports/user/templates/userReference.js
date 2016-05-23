import { Meteor } from 'meteor/meteor';

import './userReference.html';
import './userReference.scss';

Template.userReference.onRendered(function() {
    this.subscribe('user.reference', this.data.id);
});

Template.userReference.helpers({
    doc() {
        return Meteor.users.findOne({ _id: this.id });
    },

    isMe() {
        return this.id === Meteor.userId();
    },
});
