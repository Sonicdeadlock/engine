/**
 * Created by Alex on 9/22/2016.
 */
angular.module('controllers').controller('notesController',function($scope,$http,$state,$rootScope,$stateParams,$modal){
    $scope.breadcrumbs = [];
    $scope.dir = {dirs:[],notes:[]};
    $scope.note= {};
    var dirFormModal = $modal({scope:$scope,show:false,templateUrl:"/components/notes/newDirModal.tpl.html"});
    if($stateParams.type){
        if($stateParams.type == "note"){
            $http.get("/api/notes/note/"+$stateParams.id).success(function(data){
                $scope.note = data;
            });
        }else if($stateParams.type == "noteDir"){
            $http.get("/api/notes/noteDir/"+$stateParams.id).success(function(data){
               $scope.dir = data;
                $scope.breadcrumbs = [];
                if(data.parent){
                    $scope.breadcrumbs.push({
                        name:'..',
                        id:data.parent
                    });
                }
                $scope.breadcrumbs.push({
                    name:data.name,
                    id:data._id
                });
            });
        }
    }
    else if($rootScope.logged_in_user){
        $http.get("/api/notes/noteDir").success(function(data){
            $scope.rootDir = data;
            $scope.dir = data;
            $scope.breadcrumbs.push({
                name:"root",
                id:data._id
            });
        });
    }
    
    $scope.updateTitle = function(){
        $http.patch('/api/notes/note/'+$scope.note._id,{title:$scope.note.title});
    };
    
    $scope.updateBody =_.debounce( function(){
        $http.patch('/api/notes/note/'+$scope.note._id,{body:$scope.note.body});
    },500);

    $scope.selectNote=function(note){
      
          $scope.note = note;
    };

    $scope.selectDir = function(dirId){
        $http.get('/api/notes/noteDir/'+dirId).success(function(data){
            var breadcrumbIndex = _.findIndex($scope.breadcrumbs,['id',data._id]);
            if(breadcrumbIndex!=-1){
                $scope.breadcrumbs = _.take($scope.breadcrumbs,breadcrumbIndex+1);
            }
            else{
                $scope.breadcrumbs.push({
                    name:data.name,
                    id:data._id
                });
            }
            $scope.dir = data;
            $scope.note = {};
        })
    };

    $scope.newNote = function(){
        if($scope.dir._id){
            $http.post('/api/notes/note',{parent:$scope.dir._id}).success(function(data){
                $scope.note = data;
                $scope.dir.notes.push(data);
            })
        }
    };

    $scope.newDir = function(){
      dirFormModal.$promise.then(dirFormModal.show);
    };

    $scope.createDir = function(name){
        $http.post('/api/notes/noteDir',{parent:$scope.dir._id,name:name}).success(function(data){
            $scope.selectDir(data._id);
            dirFormModal.hide();
        })
    };

    $scope.deleteNote = function(){
        if($scope.note._id){
            $http.delete('/api/notes/note/'+$scope.note._id).success(function(){
                if($scope.dir._id){
                    $scope.dir.notes.splice($scope.dir.notes.indexOf($scope.note),1);
                }
                $scope.note ={};
            });
        }
    };


});