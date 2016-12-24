var mongoose = require('mongoose');
var schema = mongoose.Schema;

var permissionGroupSchema = new schema({
    name: String,
    permissions: [],
    default: Boolean,
    userAccess: String
});

module.exports = mongoose.model('permissionGroup', permissionGroupSchema);
