import { Mongo } from 'meteor/mongo';
import 'meteor/aldeed:simple-schema';

import schema from './schema';

export const Games = new Mongo.Collection('game');
Games.attachSchema(schema);
