if ('Notification' in window && Notification.permission !== "granted")
    Notification.requestPermission();
angular.module('controllers').controller('chatController', function ($scope, $http, $state, $rootScope, $cookies, socket, $alert, $modal, $stateParams) {

    $scope.chats = [];
    $scope.distplayHistory = [];
    $scope.mods = [];
    $scope.typing = [];
    $scope.roomFilter = ($stateParams.filters && $stateParams.filters != '') ? JSON.parse($stateParams.filters) : {bots: {}};
    $scope.modTypes = [
        {
            name: 'removeCharacter',
            template: {remove: ''}
        },
        {
            name: 'l337',
            template: {chance: 10}
        }
    ];
    var settings = {notificationDuration: 2000};
    var historyId = 0;
    var history = [];
    var isTyping = false;
    var numbers = ['Zero','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten'];
    var sendStopTyping = _.debounce(function(){
        isTyping = false;
        socket.emit('clientToServerStopTyping');
    },500,{trailing:true,leading:false});
    function filterRooms() {
        $scope.displayRooms = _.chain($scope.rooms)
            .filter(function (r) {
                var keys = _.keys($scope.roomFilter.bots);
                for (var i = 0; i < keys.length; i++) {
                    if ($scope.roomFilter.bots[keys[i]] && _.map(r.bots, 'name').indexOf(keys[i]) === -1)
                        return false;
                }
                return true;
            })
            .filter(function (r) {
                if (!$scope.roomFilter.searchText) return true;
                return (r.name.indexOf($scope.roomFilter.searchText) !== -1) || (r.description ? r.description.indexOf($scope.roomFilter.searchText) !== -1 : false);
            })
            .value();
    }

    $scope.filterRooms = filterRooms;
    $scope.$watch('roomFilter', function () {
        filterRooms();
    }, _.isEqual);

    $scope.chatRoom = undefined;
    $scope.rooms = [];
    $scope.passwordModal = $modal({
        scope: $scope,
        templateUrl: 'components/chat/passwordModalTemplate.html',
        show: false
    });
    socket.emit('getRooms', {});
    socket.on('chatServerToClient', function (message) {
        $scope.chats.push(message);
        if (document.body.className == 'blurred') {
            if (Notification && $scope.showAlert) {
                var notification = new Notification(message.username, {
                    body: strip(message.text)
                });
                notification.onShow = setTimeout(function () {
                    notification.close();
                }, settings.notificationDuration || 2000);
                notification.onClick = function (x) {

                    window.focus();
                    this.cancel();
                };
            }
        }
    });

    socket.on('chatRooms', function (rooms) {
        if ($stateParams.roomId && $stateParams.roomId !== "") {
            if (!($scope.enteringRoom || $scope.chatRoom))
                $scope.enterRoom(_.find(rooms, {_id: $stateParams.roomId}));
        } else {
            $scope.rooms = rooms;
            $scope.bots = _.chain(rooms).map(function (o) {
                return _.map(o.bots, 'name')
            })
                .flatten().uniq()
                .value();
            filterRooms();
        }

    });
    socket.on('connect', function () {
        if ($scope.chatRoom) {
            socket.emit('chatEnterRoom', {room: $scope.chatRoom, password: $scope.roompassword});
        }
    });
    socket.on('chatError', function (message) {
        var alert = $alert({content: message.error, placement: 'top', show: true, type: 'danger'});
        setTimeout(function () {
            alert.destroy();
        }, 1000 * 6)
    });
    socket.on('chatEnterRoom', function (message) {
        $scope.chatRoom = message.room;
    });
    socket.on('chatRoomEntrance', function (username) {
        if ($scope.chatRoom && $scope.chatRoom.options && $scope.chatRoom.options.entranceMessages)
            $scope.chats.push({text: username + ' has entered the room'});
    });
    socket.on('chatRoomExit', function (username) {
        if ($scope.chatRoom && $scope.chatRoom.options && $scope.chatRoom.options.exitMessages)
            $scope.chats.push({text: username + ' has left the room'});
    });

    $scope.exitRoom = function () {
        socket.emit('chatLeaveRoom', {});
        $scope.chatRoom = undefined;
        $scope.chats = [];
        socket.emit('getRooms', {});
        $state.go("rooms", {filters: $stateParams.filters});
    };
    $scope.sendChat = function () {
        socket.emit('chatClientToServer', {text: $scope.chatBox, mods: $scope.mods});
        history.push($scope.chatBox);
        historyId = - 1;
        $scope.distplayHistory = _.chain(history)
            .uniq()
            .takeRight(5)
            .reverse()
            .value();
        $scope.chatBox = '';
    };
    $scope.banUser = function (user_id) {
        socket.emit('chatBanUser', {user_id: user_id})
    };

    $scope.keyHandle = function ($event) {
        var keyCode = $event.keyCode;
        switch (keyCode) {
            case 38: //up
                if (historyId == -1) {
                    historyId = history.length - 1;
                } else if (historyId != 0) {
                    historyId--;
                }
                $scope.chatBox = history[historyId];
                break;
            case 40: //down
                if (historyId == -1) {
                    historyId = historyId.length - 1;
                } else if (historyId + 1 != history.length) {
                    historyId++;
                }
                $scope.chatBox = history[historyId];
                break;
            default:
                return;
        }
    };

    $scope.menuAside = {
        title: "Settings"
    };

    $scope.addMod = function (modType) {
        $scope.mods.push({
            name: modType.name,
            attributes: _.cloneDeep(modType.template)
        })
    };

    $scope.removeMod = function (mod) {
        _.pull($scope.mods, mod);
    };

    $scope.enterRoom = function (room, password) {
        $scope.enteringRoom = true;
        if (room.hasPassword) {
            if (password) {
                socket.emit('chatEnterRoom', {room: room, password: password});
                $scope.roompassword = '';
                $scope.passwordModal.$promise.then($scope.passwordModal.hide);
            } else {
                $scope.passwordModal.$promise.then($scope.passwordModal.show);
                $scope.selectedRoom = room;
            }
        }
        else
            socket.emit('chatEnterRoom', {room: room});
    };

    $scope.goToRoom = function (room) {
        $state.go('chat', {
            roomId: room._id,
            hasPassword: room.hasPassword,
            filters: JSON.stringify($scope.roomFilter)
        });
    };

    $scope.hasUsername = function (chat) {
        if ($rootScope.logged_in_user)
            return chat.text.indexOf($rootScope.logged_in_user.username) != -1;
        else
            return false;
    };

    $scope.onType = function(){
       if(!isTyping)
       {
           isTyping = true;
           socket.emit('clientToServerStartTyping');
       }
       sendStopTyping();
    };

    $scope.getTextNumber = function(index){
        if(numbers[index])
            return numbers[index];
        return index;
    };

    //settings
    $scope.showRank = $cookies.getObject('showRank');
    $scope.$watch('showRank', function (val) {
        $cookies.put('showRank', val);
    });
    $scope.showTime = $cookies.getObject('showTime');
    $scope.$watch('showTime', function (val) {
        $cookies.put('showTime', val);
    });
    $scope.showAlert = $cookies.getObject('showAlert');
    $scope.$watch('showAlert', function (val) {
        $cookies.put('showAlert', val);
    });

    if ($scope.showTime == undefined)
        $scope.showTime = true;


    socket.on('serverToClientStartTyping',function(message){
       $scope.typing.push(message.name);
    });

    socket.on('serverToClientStopTyping',function(message){
        $scope.typing.splice($scope.typing.indexOf(message.name));
    })

})
    .filter('startCase', function () {
        return function (input) {
            return _.startCase(input);
        }
    }).directive('room', function () {
    return {
        templateUrl: 'components/chat/roomIconTemplate.html'
    }
});

function strip(html) {
    var tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
}
function onBlur() {
    document.body.className = 'blurred';
}
function onFocus() {
    document.body.className = 'focused';
}

if (/*@cc_on!@*/false) { // check for Internet Explorer
    document.onfocusin = onFocus;
    document.onfocusout = onBlur;
} else {
    window.onfocus = onFocus;
    window.onblur = onBlur;
}
