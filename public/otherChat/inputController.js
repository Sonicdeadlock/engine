/**
 * Created by Sonicdeadlock on 5/25/2016.
 */
angular.module('userApp').controller("inputController",["$rootScope","$scope",'socket',
    function($rootScope,$scope,socket){
        $scope.inputText ='';

        var rooms=[];
        $scope.handleKeyPress = function($event){
            var keyCode = $event.keyCode;
            switch (keyCode){
                case 13:
                    handleEnter();
                    break;
            }
        };
        function handleEnter(){
            if(!$scope.room){
                enterRoom();
            }else if($scope.inputText==='exit'){
                exitRoom();
            }else if($scope.inputText==='clear' || $scope.inputText==='cls'){
                $rootScope.clearDisplay();
            }
            else
                sendMessage();
            $scope.inputText = '';
        }

        function sendMessage(){
            socket.emit('chatClientToServer',{text:$scope.inputText});
        }
        function enterRoom(){
            var room = _.find(rooms,{name:$scope.inputText});
            socket.emit('chatEnterRoom',{room:room});
        }
        function exitRoom(){
            socket.emit('chatLeaveRoom',{});
            socket.emit('getRooms',{});
            $scope.room = undefined;
        }
        socket.on('connect',function(){
            if($scope.room){
                socket.emit('chatEnterRoom',{room:$scope.room});
            }
        });
        socket.on('chatRooms',function(chatRooms){
            rooms = chatRooms;
        });
        socket.on('chatEnterRoom',function(message){
            $scope.room = message.room;
        });

    }]);