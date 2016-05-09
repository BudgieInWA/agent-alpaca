import { Template } from 'meteor/templating';

Template.helpers({
    and(a, b) {
        return a && b;
    },
    or(a, b) {
        return a || b;
    },
    not(a) {
        return !a;
    },

    if_Then_(condition, result) {
        if (condition) return result;
    },
});