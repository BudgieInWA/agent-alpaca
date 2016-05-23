import bob from 'lodash';
import { Template } from 'meteor/templating';

Template.helpers({
    log(...stuff) {
        console.log(...stuff);
    },

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

    isEqual(a, b) {
        return _.isEqual(a, b);
    },
    asPairs(object) {
        return _.map(_.toPairs(object), p => ({key: p[0], value: p[1]}));
    },
    lookup(object, key) {
        return object[key];
    },
});

Template.helpers({
    brandName(){
        return "Agent Alpaca";
    },
    teamName(team) {
        switch(team) {
            case 'red': return "Red Team";
            case 'blue': return "Blue Team";
            default: return team + " team";
        }
    }
});