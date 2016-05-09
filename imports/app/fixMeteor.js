import _ from 'lodash';
import { Template } from 'meteor/templating';

Template.helpers = function(helpers) {
    _.forOwn(helpers, (func, name) => {
        Template.registerHelper(name, func);
    })
};