/**
 * Created by Sonicdeadlock on 5/25/2016.
 */
angular.module('userApp').controller("displayController",["$rootScope","$scope",'socket',
    function($rootScope,$scope,socket){
        $scope.items = [];
        socket.on('chatRoomEntrance',function(username){
            $scope.items.push({text:username+" has entered the room"});
        });
        socket.on('chatRoomExit',function(username){
            $scope.items.push({text:username+" has left the room"});
        });
        socket.on('chatServerToClient',function(message){
            $scope.items.push(message);
        });
        socket.on('chatRooms',function(chatRooms){
            $scope.items.push({text:"rooms:"});
            chatRooms.forEach(function(room){
               $scope.items.push({text:room.name});
            });
        });

        $rootScope.clearDisplay = function(){
            $scope.items = [];
        }

        socket.on('chatError',function(message){
            $scope.items.push({text:message.error,class:"error"});
        });
}]);