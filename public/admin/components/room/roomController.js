/**
 * Created by alexthomas on 4/17/16.
 */
angular.module('controllers').controller('roomController',function($scope,$http,$rootScope){
    $http.get('/api/rooms').success(function(data){
       $scope.rooms = data;

    });
    $scope._ = _;
    $scope.selectedRoom = undefined;
    $scope.addRoom = function(){
        //call on the normal creator modal
    };
    $scope.selectRoom = function(room){
        $scope.selectedRoom = room;
        if($scope.selectedRoom.bans){
            $scope.selectedRoom.bans = _.map($scope.selectedRoom.bans,function(ban){
                return {username:'',id:ban};
            });
            _.forEach($scope.selectedRoom.bans,function(ban){
                $http.post('/api/users/getUser',{_id:ban.id}).success(function(data){
                    _.find($scope.selectedRoom.bans,{id:ban.id}).username = data.username;
                })
            });

        }
    };
    $scope.updateName = function(){//use selected room
        $http.post('/api/rooms/changeName',{id:$scope.selectedRoom._id,name:$scope.selectedRoom.name});
    };
    $scope.updateDescription = function(){//use selected room
        $http.post('/api/rooms/changeDescription',{id:$scope.selectedRoom._id,description:$scope.selectedRoom.description});
    };
    $scope.updatePassword = function(){//use selected room
        $http.post('/api/rooms/changePassword',{id:$scope.selectedRoom._id,password:$scope.selectedRoom.password});
    };
    $scope.updateOptions = function(){//use selected room
        $http.post('/api/rooms/changeOptions',{id:$scope.selectedRoom._id,options:$scope.selectedRoom.options});
    };
    $scope.removeBan = function(id){//use selected room for room-id
        $http.post('/api/rooms/removeBan',{id:$scope.selectedRoom._id,ban:id});
    };
    $scope.toggleBot = function(bot){//use selected room for id and reference
        if(_.find($scope.selectedRoom.bots,{name:bot})){
            $http.post('/api/rooms/removeBot',{id:$scope.selectedRoom._id,bot:bot});
            $scope.selectedRoom.bots = _.reject( $scope.selectedRoom.bots,{name:bot});
        }else{
            $http.post('/api/rooms/addBot',{id:$scope.selectedRoom._id,bot:bot});
            $scope.selectedRoom.bots.push({name:bot})
        }
    };

});