import { Mongo } from 'meteor/mongo';
import 'meteor/aldeed:simple-schema';

import schema from './schema.js'

let Games = new Mongo.Collection('game');
Games.attachSchema(schema);

export default Games;
