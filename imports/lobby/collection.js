import { Mongo } from 'meteor/mongo';

let Lobbies = new Mongo.Collection('lobby');
Lobbies.attachSchema(schema);

export default Lobbies;
