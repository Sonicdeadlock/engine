/**
 * Created by Sonicdeadlock on 4/24/2016.
 */
var express = require('express');
var router = express.Router();
var db = require('../../db');
var _ = require('lodash');
var update_notesModel = require('../../models/update_notes');
var update_notes = db.model('update_notes');
var updateNotesController = require('../../controllers/updateNotesController');

router.route('/')
    .get(updateNotesController.get)
    .post(updateNotesController.create);

router.route('/count')
    .get(updateNotesController.count);

module.exports = router;