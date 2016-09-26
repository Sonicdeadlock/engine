/**
 * Created by alexthomas on 9/22/16.
 */
var _ = require('lodash');
var userController = require('../../controllers/userController');
var notesController = require('../../controllers/noteController');
var notesDirController = require('../../controllers/noteDirController');
var express = require('express');
var router = express.Router();

router.route('/note')
    .post(userController.requiresLogin,notesController.create);

router.route('/note/:id')
    .get(notesController.getNote)
    .patch(userController.requiresLogin,notesController.updateNote)
    .delete(userController.requiresLogin,notesController.deleteNote);

router.route('/note/:id/append')
    .post(userController.requiresLogin,notesController.append);

router.route('/note/:id/private')
    .patch(userController.requiresLogin,notesController.patchPrivate);

router.route('/note/:id/private')
    .patch(userController.requiresLogin,notesController.patchSharedEditable);


router.route('/noteDir')
    .get(userController.requiresLogin,notesDirController.getUserBase)
    .post(userController.requiresLogin,notesDirController.createDir);

router.route('/noteDir/:id')
    .get(notesDirController.getDir);



module.exports = router;