/**
 * Created by alexthomas on 7/21/15.
 */
angular.module('controllers').controller('manageController',function($scope,$http,$state,$rootScope){
    function updateUsers(){
        $http.get('/auth').success(function(data){
            $scope.users = data;
        });
    }
    function updateGroups(){
        $http.get('/api/permissionGroups').success(function(data){
            $scope.groups = data;
        })
    }

    $scope.newGroup = function(){
        $scope.selectedGroup={
            permissions:[]
        };
    };

    updateGroups();
    updateUsers();
    $scope.newGroup();
    $scope.activePanel = 'user';
    $scope.user = {};
    $scope.edit=false;
    $scope.changed = false;
    $scope.toggleShowInput = function(input){$scope['show_'+input+'_input'] = !$scope['show_'+input+'_input']};
    $scope.toggleEdit = function(){$scope.edit=!$scope.edit;};
    $scope.submit = function(){
        $scope.user._id = $rootScope.logged_in_user._id;
        $http.put('/auth',$scope.user).
        success(function(){
                $scope.edit=false;
        }).
        error(function(data,status){
                console.log(data);
            });
    };
    $scope.checkUsername = function(){
        $scope.checkingUsername = true;
        $http.post('/api/users/getUser',{username:$scope.user.username})
            .success(function(data){
                $scope.checkingUsername = false;
                $scope.usernameTaken = data !=null;
            })
    };
    $scope.selectGroup = function(group){
      $scope.selectedGroup = group;
    };
    $scope.selectUser = function(user){
      $scope.selectedUser = user;
    };
    $scope.submitGroup = function(){
        var group = $scope.selectedGroup;
        if(group._id){
            $http.put('/api/permissionGroups',group).success(function(data){updateGroups();});
        }else{
            $http.post('/api/permissionGroups',group).success(function(data){updateGroups();});
        }
    };
    $scope.deleteGroup = function(){
        var group = $scope.selectedGroup;
        if(group._id){
            $http.delete('/api/permissionGroups/'+group._id).success(function(data){updateGroups();$scope.newGroup();});
        }
    };
    $scope.saveUser =function(){
        var user = $scope.selectedUser;
        $http.put('/api/users',user).
            success(function(){
                updateUsers();
            })
    }
}).directive('focusMe', function($timeout) {
        return {
            link: function(scope, element, attrs) {
                scope.$watch(attrs.focusMe, function(value) {
                    if(value === true) {
                        console.log('value=',value);
                        $timeout(function() {
                        element[0].focus();
                        });
                    }
                });
            }
        };
    });