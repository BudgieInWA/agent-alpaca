import { Mongo } from 'meteor/mongo';
import 'meteor/aldeed:simple-schema';

import schema from './schema';

export const Lobbies = new Mongo.Collection('lobby');
Lobbies.attachSchema(schema);
