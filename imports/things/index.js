import { Random } from 'meteor/random';

import nouns from './nouns.js';
import adjectives from './adjectives.js';


function transformCase(letterCase, word) {
    switch(letterCase) {
        case 'lower': return word.toLowerCase();
        case 'upper': return word.toUpperCase();
        case 'title': return word.charAt(0).toUpperCase() + word.substr(1).toLowerCase();
        default: throw Error(`Unknown letterCase '${letterCase}'.`);
    }
}

export default {
    noun({ letterCase = 'lower' }) {
        return transformCase(letterCase, Random.choice(nouns));
    },

    adjective({letterCase = 'lower'}) {
        return transformCase(letterCase, Random.choice(adjectives));
    },

    fancyNoun({ letterCase = 'lower' }) {
        return this.adjective({ letterCase }) + " " + this.noun({ letterCase });
    },
}