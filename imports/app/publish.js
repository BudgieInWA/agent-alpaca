import { Meteor } from  'meteor/meteor';

Meteor.publish('user.reference', function(id) {
    check(id, String);

    return Meteor.users.find(
        { _id: id },
        { fields: { _id: 1 } }
    );
});