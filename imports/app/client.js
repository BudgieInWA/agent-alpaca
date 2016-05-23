import { Meteor } from 'meteor/meteor';


// Monkeypatch various meteor bits to change things that are silly.
import './fixMeteor.js';

// Set up routes.
import './routes';

import './templates';

// Trigger each modules entry point.
import '/imports/user/client';
import '/imports/game/client';
import '/imports/lobby/client';
