/**
 * Created by Sonicdeadlock on 5/25/2016.
 */
angular.module('userApp').controller("displayController", ["$rootScope", "$scope", 'socket', '$interval',
    function ($rootScope, $scope, socket, $interval) {
        $scope.items = [];
        var buffer = [];
        socket.on('chatRoomEntrance', function (username) {
            addItem({text: username + " has entered the room"});
        });
        socket.on('chatRoomExit', function (username) {
            addItem({text: username + " has left the room"});
        });
        socket.on('chatServerToClient', function (message) {
            _(message.text.split("<br>"))
                .map(function (line) {
                    var clone = _.clone(message);
                    clone.text = line;
                    return clone;
                })
                .forEach(function (line) {
                    addItem(line);
                });
        });
        socket.on('chatRooms', function (chatRooms) {
            chatRooms.forEach(function (room) {
                addItem({text: room.name});
            });
        });

        $rootScope.clearDisplay = function () {
            $scope.items = [];
        };

        socket.on('chatError', function (message) {
            addItem({text: message.error, class: "error"})
        });

        function addItem(item) {
            buffer.push(item);
        }

        $rootScope.displayText = function (text) {
            addItem({text: text});
        };

        $interval(function () {
            var lastItem = _.last($scope.items);
            if (lastItem && !lastItem.finished) {
                if (!lastItem.displayText) {
                    lastItem.displayText = "";
                }
                if (!lastItem.progress) {
                    lastItem.progress = 0;
                }
                if (!lastItem.characters) {
                    lastItem.characters = _.map(lastItem.text.split(''), function (c) {
                        return {character: c, found: false, count: 0}
                    });
                }
                step(lastItem);
                if (lastItem.text == lastItem.displayText) {
                    lastItem.finished = true;
                }
            } else if (_.head(buffer)) {
                $scope.items.push(buffer.shift());
            }

        }, 40)

    }]);

function step(item) {
    var active = 0;
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789\"':;/.,!@#$%^&*(){}[]|\\`~-=_+<> @#$%^&()[]{}<>";
    item.displayText = '';
    for (var i = 0; i < item.characters.length; i++) {
        var character = item.characters[i];
        if (character.found) {
            item.displayText += character.character;
        } else if (active < 10) {
            active++;
            if (character.character == ' ' || character.count > 40 || _.random(true) < .05) {
                character.found = true;
                item.displayText += character.character;
            } else {
                character.count++;
                item.displayText += _.sample(possible);

            }
        }
    }
}