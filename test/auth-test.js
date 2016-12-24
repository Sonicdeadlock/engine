/**
 * Created by alexthomas on 5/7/16.
 */
var should = require('should');
var assert = require('assert');
var _ = require('lodash');
var db = require('../db');
var config = require('../config');
var app = require('../server');
var supertest = require('supertest');
var Session = require('supertest-session');
var crypto = require('crypto');


var userModel = require('../models/user');
var permissionGroupModel = require('../models/permissionGroup');

describe('auth api test', function () {
    before(function (next) {
        db.once('open', next);
    });
    function * nextUsername() {
        var index = 0;
        var baseUsername = 'unused_username';
        while (true) {
            yield (baseUsername + index);
            index++;
        }
    }

    var usernameGen = nextUsername();

    function assertUsers(expectation, actual, properties) {
        if (!properties) {
            properties = ['username', 'email', 'firstName', 'lastName'];
        }
        properties.forEach(function (property) {
            expectation[property].should.eql(actual[property]);
        });
    }

    var validUserParts = {
        firstName: ['some name', 'alex', 'ALEX', 'ben'],
        lastName: ['some name', 'thomas', 'THOMAS', 'jiang'],
        email: ['someEmail@gmail.com', 'other_email@emailProvider.com', 'additional.email@provider.email', 'email@email.provider.com'],
        password: ['some password', 'other password', '12345678', 'a1b2c3d4']
    };
    describe('create user', function () {
        describe('create valid users', function () {
            var request;
            var defaultGroup;
            beforeEach(function () {
                request = new Session(app);
            });

            before(function (next) {
                permissionGroupModel.findOne({default: true}).then(function (result) {
                    defaultGroup = result;
                    next();
                });
            });
            function testCreateUser(userData, callback) {
                it('should successfully create a user', function (done) {
                    request.post('/auth')
                        .send(userData)
                        .expect(200)
                        .end(function (err, result) {
                            if (err) {
                                console.log(result.body);
                                done(err);
                            }
                            else {
                                result = result.body;
                                result._id.should.not.be.eql(undefined);
                                userModel.findById(result._id).then(function (result) {
                                    assertUsers(userData, result);
                                    var beforeNow = (new Date(result.joinDate)) < Date.now();
                                    beforeNow.should.equal(true);
                                    result.group.id.should.equal(defaultGroup._id.id);
                                    done();
                                    if (callback) {
                                        callback();
                                    }

                                }, function (err) {
                                    done(err);
                                });
                            }


                        });
                });
            }


            _.forEach(_.keys(validUserParts), function (key) {
                _.forEach(validUserParts[key], function (value) {
                    var user = _.mapValues(validUserParts, _.head);
                    user[key] = value;
                    user.passwordAgain = user.password;
                    user.username = usernameGen.next().value;
                    testCreateUser(user);
                });
            });
            it('should create a user when the group is passed through and still use the default group', function (done) {
                var user = _.mapValues(validUserParts, _.head);
                user.passwordAgain = user.password;
                user.username = usernameGen.next().value;
                user.group = '572da26fa27ad4ec17028fb9';
                request.post('/auth')
                    .send(user)
                    .expect(200)
                    .end(function (err, result) {
                        if (err) {
                            console.log(result.body);
                            done(err);
                        }
                        else {
                            result = result.body;
                            result._id.should.not.be.eql(undefined);
                            userModel.findById(result._id).then(function (result) {
                                assertUsers(user, result);
                                var beforeNow = (new Date(result.joinDate)) < Date.now();
                                beforeNow.should.equal(true);
                                result.group.id.should.equal(defaultGroup._id.id);
                                done();

                            }, function (err) {
                                done(err);
                            });
                        }
                    });

            });

        });
        describe('fail to create invalid users', function () {
            var request;
            beforeEach(function () {
                request = new Session(app);
            });
            function testCreateUser(userData, details) {
                it('should fail to create user with ' + details, function (done) {
                    request.post('/auth')
                        .send(userData)
                        .expect(400)
                        .end(function (err, result) {
                            if (err) {
                                done(err);
                            }
                            else {
                                done();
                            }
                        });
                });
            }

            var invalidUserParts = {
                firstName: [undefined],
                lastName: [undefined],
                email: ['abc', '123', 'abc123', 'email@', '.com', 'email@.com', 'email@com'],
                password: [undefined]
            };
            _.forEach(_.keys(invalidUserParts), function (key) {
                _.forEach(invalidUserParts[key], function (value) {
                    var user = _.mapValues(validUserParts, _.head);
                    user[key] = value;
                    user.passwordAgain = user.password;

                    testCreateUser(user, key + ': ' + value);
                });
            });
            it('should fail to create a user with an existing username', function (done) {
                var user = _.mapValues(validUserParts, _.head);
                user.passwordAgain = user.password;
                user.username = 'root';
                request.post('/auth')
                    .send(user)
                    .expect(400)
                    .end(function (err, result) {
                        if (err) {
                            console.log(result.body);
                            done(err);
                        }
                        else {
                            done();
                        }
                    });
            });

        });
        describe('a newly registered user is logged in', function () {
            var request;
            var user = _.mapValues(validUserParts, _.head);
            user.passwordAgain = user.password;
            user.username = usernameGen.next().value;
            before(function () {
                request = new Session(app);

            });
            it('should be logged in', function (done) {
                request.post('/auth').send(user).expect(200).end(function (err) {
                    if (err) {
                        done(err);
                    }
                    else {
                        request.get('/auth/self')
                            .expect(200)
                            .end(function (err, result) {
                                if (err) {
                                    console.log(result.body);
                                    done(err);
                                }
                                else {
                                    assertUsers(user, result.body);
                                    should.not.exist(result.body.password);
                                    should.not.exist(result.body.salt);
                                    done();
                                }
                            });
                    }
                });

            });
        });
    });

    describe('log a user in', function () {
        describe('successfully', function () {
            var request = new Session(app);
            it('should log a user in', function (done) {
                request.post('/auth/login')
                    .send({username: 'root', password: 'root'})
                    .expect(200)
                    .end(function (err, result) {
                        if (err) {
                            done(err);
                        }
                        else {
                            var rootUser = {username: 'root', firstName: 'root', lastName: 'root'};
                            assertUsers(rootUser, result.body, ['username', 'firstName', 'lastName']);
                            done();
                        }
                    });
            });
            it('should let the user get self', function (done) {
                request.get('/auth/self')
                    .expect(200)
                    .end(function (err, result) {
                        if (err) {
                            done(err);
                        }
                        else {
                            var rootUser = {username: 'root', firstName: 'root', lastName: 'root'};
                            assertUsers(rootUser, result.body, ['username', 'firstName', 'lastName']);
                            should.not.exist(result.body.password);
                            should.not.exist(result.body.salt);
                            done();
                        }
                    });
            });
        });
        describe('bad login', function () {
            var badUsernames = ['somebody', 'username', 'password', 'sudo', 'admin', '12345', '1', 'root1', '1root', 'aroot',
                'roota', 'Root', 'rOOt', 'rOOT', 'ROOT', '!', '.', ',', '@', '#', '$', '%', '^', '&', '*', '(,', ')', '!root', '.root',
                ',root', '@root', '#root', '$root', '%root', '^root', '&root', '*root', '(root', ')root', 'root!', 'root.', 'root,',
                'root@', 'root#', 'root$', 'root%', 'root^', 'root&', 'root*', 'root(', 'root)', '(root)', '{root}', '[root]'];
            var badPasswords = ['somebody', 'username', 'password', 'sudo', 'admin', '12345', '1', 'root1', '1root', 'aroot',
                'roota', 'Root', 'rOOt', 'rOOT', 'ROOT', '!', '.', ',', '@', '#', '$', '%', '^', '&', '*', '(,', ')', '!root', '.root',
                ',root', '@root', '#root', '$root', '%root', '^root', '&root', '*root', '(root', ')root', 'root!', 'root.', 'root,',
                'root@', 'root#', 'root$', 'root%', 'root^', 'root&', 'root*', 'root(', 'root)', '(root)', '{root}', '[root]', 'Password', 'password1', '1password', 'apassword',
                'passworda', 'password', 'password', 'password', 'password', '!', '.', ',', '@', '#', '$', '%', '^', '&', '*', '(,', ')', '!password', '.password',
                ',password', '@password', '#password', '$password', '%password', '^password', '&password', '*password', '(password', ')password', 'password!', 'password.', 'password,',
                'password@', 'password#', 'password$', 'password%', 'password^', 'password&', 'password*', 'password(', 'password)', '(password)', '{password}', '[password]'];
            describe('with root password independent', function () {//there is a default user root/root
                var request;
                beforeEach(function () {
                    request = new Session(app);
                });
                badUsernames.forEach(function (username) {
                    it('should fail to login with username: ' + username + ' and password: root', function (done) {
                        request.post('/auth/login')
                            .send({username: username, password: 'password'})
                            .expect(400)
                            .end(function (err, result) {
                                if (err) {
                                    done(err);
                                }
                                else {
                                    result.body.should.eql({message: 'Incorrect username.'});
                                    done();
                                }
                            });
                    });
                });

            });
            describe('with root password in sequence', function () {//there is a default user root/root
                var request;
                before(function () {
                    request = new Session(app);
                });
                badUsernames.forEach(function (username) {
                    it('should fail to login with username: ' + username + ' and password: root', function (done) {
                        request.post('/auth/login')
                            .send({username: username, password: 'root'})
                            .expect(400)
                            .end(function (err, result) {
                                if (err) {
                                    done(err);
                                }
                                else {
                                    result.body.should.eql({message: 'Incorrect username.'});
                                    done();
                                }
                            });
                    });
                });

            });

            describe('with root username independent', function () {//there is a default user root/root
                var request;
                beforeEach(function () {
                    request = new Session(app);
                });
                badPasswords.forEach(function (password) {
                    it('should fail to login with username: root and password: ' + password, function (done) {
                        request.post('/auth/login')
                            .send({username: 'root', password: password})
                            .expect(400)
                            .end(function (err, result) {
                                if (err) {
                                    done(err);
                                }
                                else {
                                    result.body.should.eql({message: 'Incorrect password.'});
                                    done();
                                }
                            });
                    });
                });

            });
            describe('with root username sequence', function () {//there is a default user root/root
                var request;
                before(function () {
                    request = new Session(app);
                });
                badPasswords.forEach(function (password) {
                    it('should fail to login with username: root and password: ' + password, function (done) {
                        request.post('/auth/login')
                            .send({username: 'root', password: password})
                            .expect(400)
                            .end(function (err, result) {
                                if (err) {
                                    done(err);
                                }
                                else {
                                    result.body.should.eql({message: 'Incorrect password.'});
                                    done();
                                }
                            });
                    });
                });

            });
            var request = new Session(app);
            it('should fail without a username', function (done) {
                request.post('/auth/login')
                    .send({password: 'root'})
                    .expect(400)
                    .end(function (err, result) {
                        if (err) {
                            done(err);
                        }
                        else {
                            result.body.should.eql({message: 'Missing credentials'});
                            done();
                        }
                    });
            });
            it('should fail without a password', function (done) {
                request.post('/auth/login')
                    .send({username: 'root'})
                    .expect(400)
                    .end(function (err, result) {
                        if (err) {
                            done(err);
                        }
                        else {
                            result.body.should.eql({message: 'Missing credentials'});
                            done();
                        }
                    });
            });


        });

    });

    describe('get self while not logged in', function () {
        it('should fail to get self', function (done) {
            var request = new Session(app);
            request.get('/auth/self')
                .expect(401)
                .end(function (err) {
                    if (err) {
                        done(err);
                    }
                    else {
                        done();
                    }
                });
        });
    });

    describe('log a user out', function () {
        var request;
        beforeEach(function () {
            request = new Session(app);
        });

        it('should log the user out', function (done) {
            request.post('/auth/login')
                .send({username: 'root', password: 'root'})
                .expect(200)
                .end(function (err) {
                    if (err) {
                        done(err);
                    }
                    else {
                        request.get('/auth/logout')
                            .expect(200)
                            .end(function (err) {
                                if (err) {
                                    done(err);
                                }
                                else {
                                    done();
                                }
                            });
                    }
                });
        });
        it('should log the user out', function (done) {
            request.get('/auth/logout')
                .expect(200)
                .end(function (err) {
                    if (err) {
                        done(err);
                    }
                    else {
                        done();
                    }
                });
        });
    });

    describe('change a user', function () {
        describe('with login', function () {
            var request;
            beforeEach(function (next) {
                request = new Session(app);
                var user = _.mapValues(validUserParts, _.head);
                user.passwordAgain = user.password;
                user.username = usernameGen.next().value;
                request.post('/auth')
                    .send(user)
                    .expect(200)
                    .end(function (err) {
                        if (err) {
                            next(err);
                        }
                        else {
                            next();
                        }
                    });
            });

            it('should change the user\'s username', function (done) {
                request.get('/auth/self')
                    .expect(200)
                    .end(function (err, result) {
                        if (err) {
                            done(err);
                        }
                        else {
                            var beforeChangeUser = result.body;
                            var userClone = _.cloneDeep(beforeChangeUser);
                            userClone.username = usernameGen.next().value;
                            request.put('/auth')
                                .send(userClone)
                                .end(function (err) {
                                    if (err) {
                                        done(err);
                                    }
                                    else {
                                        request.get('/auth/self')
                                            .expect(200)
                                            .end(function (err, result) {
                                                if (err) {
                                                    done(err);
                                                }
                                                else {
                                                    var afterChangeUser = result.body;
                                                    assertUsers(userClone, afterChangeUser);
                                                    afterChangeUser.username.should.not.equal(beforeChangeUser.username);
                                                    done();
                                                }
                                            });
                                    }
                                });
                        }

                    });
            });

            it('should change the user\'s first name', function (done) {
                request.get('/auth/self')
                    .expect(200)
                    .end(function (err, result) {
                        if (err) {
                            done(err);
                        }
                        else {
                            var beforeChangeUser = result.body;
                            var userClone = _.cloneDeep(beforeChangeUser);
                            userClone.firstName = 'anUnusedName';
                            request.put('/auth')
                                .send(userClone)
                                .end(function (err) {
                                    if (err) {
                                        done(err);
                                    }
                                    else {
                                        request.get('/auth/self')
                                            .expect(200)
                                            .end(function (err, result) {
                                                if (err) {
                                                    done(err);
                                                }
                                                else {
                                                    var afterChangeUser = result.body;
                                                    assertUsers(userClone, afterChangeUser);
                                                    afterChangeUser.firstName.should.not.equal(beforeChangeUser.firstName);
                                                    done();
                                                }
                                            });
                                    }
                                });
                        }

                    });
            });

            it('should change the user\'s last name', function (done) {
                request.get('/auth/self')
                    .expect(200)
                    .end(function (err, result) {
                        if (err) {
                            done(err);
                        }
                        else {
                            var beforeChangeUser = result.body;
                            var userClone = _.cloneDeep(beforeChangeUser);
                            userClone.lastName = 'anUnusedName';
                            request.put('/auth')
                                .send(userClone)
                                .end(function (err) {
                                    if (err) {
                                        done(err);
                                    }
                                    else {
                                        request.get('/auth/self')
                                            .expect(200)
                                            .end(function (err, result) {
                                                if (err) {
                                                    done(err);
                                                }
                                                else {
                                                    var afterChangeUser = result.body;
                                                    assertUsers(userClone, afterChangeUser);
                                                    afterChangeUser.lastName.should.not.equal(beforeChangeUser.lastName);
                                                    done();
                                                }
                                            });
                                    }
                                });
                        }

                    });
            });

            it('should change the user\'s email', function (done) {
                request.get('/auth/self')
                    .expect(200)
                    .end(function (err, result) {
                        if (err) {
                            done(err);
                        }
                        else {
                            var beforeChangeUser = result.body;
                            var userClone = _.cloneDeep(beforeChangeUser);
                            userClone.email = 'anotheremail@gmail.com';
                            request.put('/auth')
                                .send(userClone)
                                .end(function (err) {
                                    if (err) {
                                        done(err);
                                    }
                                    else {
                                        request.get('/auth/self')
                                            .expect(200)
                                            .end(function (err, result) {
                                                if (err) {
                                                    done(err);
                                                }
                                                else {
                                                    var afterChangeUser = result.body;
                                                    assertUsers(userClone, afterChangeUser);
                                                    afterChangeUser.email.should.not.equal(beforeChangeUser.email);
                                                    done();
                                                }
                                            });
                                    }
                                });
                        }

                    });
            });

            it('should change the user\'s password', function (done) {
                request.get('/auth/self')
                    .expect(200)
                    .end(function (err, result) {
                        if (err) {
                            done(err);
                        }
                        else {
                            var beforeChangeUser = result.body;
                            var userClone = _.cloneDeep(beforeChangeUser);
                            userClone.password = 'someOtherPassword';
                            request.put('/auth')
                                .send(userClone)
                                .end(function (err) {
                                    if (err) {
                                        done(err);
                                    }
                                    else {
                                        request.get('/auth/self')
                                            .expect(200)
                                            .end(function (err, result) {
                                                if (err) {
                                                    done(err);
                                                }
                                                else {
                                                    var afterChangeUser = result.body;
                                                    assertUsers(userClone, afterChangeUser);
                                                    userModel.findById(afterChangeUser._id, 'password salt').then(function (result) {
                                                        var password = crypto.pbkdf2Sync(userClone.password, result.salt, config.hash.itterations, config.hash.length).toString('base64');
                                                        password.should.equal(result.password);
                                                        done();
                                                    });
                                                }
                                            });
                                    }
                                });
                        }

                    });
            });

            it('should fail to change the username to an already existing one', function (done) {
                request.get('/auth/self')
                    .expect(200)
                    .end(function (err, result) {
                        if (err) {
                            done(err);
                        } else {
                            var user = result.body;
                            user.username = 'root';
                            request.put('/auth')
                                .send(user)
                                .expect(400)
                                .end(function (err) {
                                    if (err) {
                                        done(err);
                                    } else {
                                        done();
                                    }
                                });
                        }
                    });
            });

            it('should fail to change the email to an invalid one', function (done) {
                request.get('/auth/self')
                    .expect(200)
                    .end(function (err, result) {
                        if (err) {
                            done(err);
                        } else {
                            var user = result.body;
                            user.email = 'root';
                            request.put('/auth')
                                .send(user)
                                .expect(400)
                                .end(function (err) {
                                    if (err) {
                                        done(err);
                                    } else {
                                        done();
                                    }
                                });
                        }
                    });
            });

            it('should fail to change the user\'s group', function (done) {
                request.get('/auth/self')
                    .expect(200)
                    .end(function (err, result) {
                        if (err) {
                            done(err);
                        }
                        else {
                            var beforeChangeUser = result.body;
                            var userClone = _.cloneDeep(beforeChangeUser);
                            userClone.group = "572d7a3d6f775fb187f549fe";
                            request.put('/auth')
                                .send(userClone)
                                .end(function (err) {
                                    if (err) {
                                        done(err);
                                    }
                                    else {
                                        request.get('/auth/self')
                                            .expect(200)
                                            .end(function (err, result) {
                                                if (err) {
                                                    done(err);
                                                }
                                                else {
                                                    var afterChangeUser = result.body;
                                                    assertUsers(userClone, afterChangeUser);
                                                    userModel.findById(afterChangeUser._id, 'group').then(function (result) {
                                                        result.group.should.not.equal(userClone.group);
                                                        done();
                                                    });
                                                }
                                            });
                                    }
                                });
                        }

                    });
            });
        });

        describe('without login', function () {
            var request;
            beforeEach(function () {
                request = new Session(app);
            });


            it('should fail to update it\'s self without being logged in', function (done) {
                request.put('/auth')
                    .send({})
                    .expect(401)
                    .end(function (err) {
                        if (err) {
                            done(err);
                        }
                        else {
                            done();
                        }
                    });
            });
        });


    });
});