/**
 * Created by Sonicdeadlock on 5/25/2016.
 */
angular.module('userApp').controller("displayController",["$rootScope","$scope",'socket','$interval',
    function($rootScope,$scope,socket,$interval){
        $scope.items = [];
        var buffer = [];
        socket.on('chatRoomEntrance',function(username){
            addItem({text:username+" has entered the room"});
        });
        socket.on('chatRoomExit',function(username){
            addItem({text:username+" has left the room"});
        });
        socket.on('chatServerToClient',function(message){
            addItem(message);
        });
        socket.on('chatRooms',function(chatRooms){
            chatRooms.forEach(function(room){
               addItem({text:room.name});
            });
        });

        $rootScope.clearDisplay = function(){
            $scope.items = [];
        };

        socket.on('chatError',function(message){
            addItem({text:message.error,class:"error"})
        });

        function addItem(item){
            buffer.push(item);
        }

        $rootScope.displayText = function(text){
            addItem({text:text});
        };

        $interval(function(){
            var lastItem = _.last($scope.items);
            if( lastItem && !lastItem.finished){
                if(!lastItem.displayText){
                    lastItem.displayText="";
                }
                lastItem.displayText += lastItem.text[lastItem.displayText.length];
                if(lastItem.text.length==lastItem.displayText.length){
                    lastItem.finished= true;
                }
            }else if(_.head(buffer)){
                $scope.items.push(buffer.shift());
            }

        },40)

}]);