import { Mongo } from 'meteor/mongo';
import 'meteor/aldeed:simple-schema';

import schema from './schema.js'

let Lobbies = new Mongo.Collection('lobby');
Lobbies.attachSchema(schema);

export default Lobbies;
