/**
 * Created by Sonicdeadlock on 3/1/2016.
 */
'use strict';

var app = angular.module('userApp', [
    'ngResource',
    'ui.router',
    'controllers',
    'services',
    'directives',
    'ngSanitize',
    'btford.socket-io',
    'luegg.directives',
    'uiSwitch'

]);

app.run(['$rootScope', '$state', '$stateParams','$http', function ($rootScope, $state, $stateParams,$http) {
    $rootScope.$on("$stateChangeError", console.log.bind(console));

    //Save a copy of the parameters so we can access them from all the controllers
    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;
    $http.get('/auth/self').success(function(data){
        $rootScope.logged_in_user = data;


    });
    $rootScope.hasPermission = function(perm){
        var user = $rootScope.logged_in_user;
        if(!user || !user.group || !user.group.permissions) return false;
        var permissions = user.group.permissions;
        if(permissions.indexOf('god')!=-1 || permissions.indexOf('sudo')!=-1) return true;
        if(permissions.indexOf(perm)!=-1) return true;
        return false;
    }

}]);
app.config(['$stateProvider','$urlRouterProvider',function($stateProvider,$urlRouterProvider){
    $urlRouterProvider.otherwise('/');

    $stateProvider
        .state('home',{
            url:'/',
            views:{
                navbar:{
                    templateUrl:"components/navbar/navbarView.html",
                    controller:"navbarController"
                },
                content:{
                    templateUrl:"components/home/homeView.html",
                    controller:"homeController"
                }
            }
        }).state('chat',{
            url:'/chat',
            views:{
                navbar:{
                    templateUrl:"components/navbar/navbarView.html",
                    controller:"navbarController"
                },
                content:{
                    templateUrl:"components/chat/chatView.html",
                    controller:"chatController"
                }
            }
        })
        .state('userPage',{
            url:'/user/:userId',
            views:{
                navbar:{
                    templateUrl:"components/navbar/navbarView.html",
                    controller:"navbarController"
                },
                content:{
                    templateUrl:"components/user/userPageView.html",
                    controller:"userPageController"
                }
            }
        }).state('inbox',{
            url:'/messages/inbox?id',
            views:{
                navbar:{
                    templateUrl:"components/navbar/navbarView.html",
                    controller:"navbarController"
                },
                content:{
                    templateUrl:"components/messages/inboxView.html",
                    controller:"inboxController"
                }
            }
        })
        .state('compose',{
            url:'/messages/compose?userId',
            views:{
                navbar:{
                    templateUrl:"components/navbar/navbarView.html",
                    controller:"navbarController"
                },
                content:{
                    templateUrl:"components/messages/composeView.html",
                    controller:"composeController"
                }
            }
        });
}]);
app.factory('socket', function (socketFactory) {
    return socketFactory({ioSocket: io.connect()});
});
angular.module('controllers',['ngAnimate','mgcrea.ngStrap','ngCookies']);
angular.module('directives',['ngAnimate','mgcrea.ngStrap']);
angular.module('services',[]);