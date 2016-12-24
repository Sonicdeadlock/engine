/**
 * Created by Sonicdeadlock on 5/25/2016.
 */
angular.module('userApp').controller("inputController", ["$rootScope", "$scope", 'socket', '$http',
    function ($rootScope, $scope, socket, $http) {
        $scope.inputText = '';

        var rooms = [];
        $scope.handleKeyPress = function ($event) {
            var keyCode = $event.keyCode;
            switch (keyCode) {
                case 13:
                    handleEnter();
                    break;
            }
        };
        function handleEnter() {
            if ($scope.inputText === 'cd ..') {
                $rootScope.displayText(getFormattedInput());
                exitRoom();
            }
            else if (_.startsWith($scope.inputText, 'cd ')) {
                $rootScope.displayText(getFormattedInput());
                enterRoom();
            } else if ($scope.inputText === 'clear' || $scope.inputText === 'cls') {
                $rootScope.clearDisplay();
            }
            else if (!$scope.room && $scope.inputText === 'ls') {
                socket.emit('getRooms', {});
            } else if ($scope.inputText === '!code') {
                $http.get('/otherChat2/all the code.txt')
                    .success(function (text) {
                        text.split('\n').forEach(function (line) {
                            $rootScope.displayText(line);
                        })
                    })
            }
            else if ($scope.room)
                sendMessage();
            else
                $rootScope.displayText(getFormattedInput());

            $scope.inputText = '';
        }

        function sendMessage() {
            socket.emit('chatClientToServer', {text: $scope.inputText});
        }

        function enterRoom() {
            var room = _.find(rooms, {name: $scope.inputText.slice(3)});
            if (!room) {
                $rootScope.displayText("-bash: cd: " + $scope.inputText.slice(3) + ": No such file or directory");
            }
            else
                socket.emit('chatEnterRoom', {room: room});
        }

        function exitRoom() {
            socket.emit('chatLeaveRoom', {});
            socket.emit('getRooms', {});
            $scope.room = undefined;
        }

        socket.on('connect', function () {
            if ($scope.room) {
                socket.emit('chatEnterRoom', {room: $scope.room});
            }
            $rootScope.displayText(getFormattedInput() + "ls");
        });
        socket.on('chatRooms', function (chatRooms) {
            rooms = chatRooms;
        });
        socket.on('chatEnterRoom', function (message) {
            $scope.room = message.room;
        });
        function getFormattedInput() {
            return "[" + $rootScope.logged_in_user.username + " " + ($scope.room ? $scope.room.name : "~") + "]$ " + $scope.inputText;
        }
    }]);