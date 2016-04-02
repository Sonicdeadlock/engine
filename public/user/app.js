/**
 * Created by Sonicdeadlock on 7/21/2015.
 */
'use strict';

var app = angular.module('userApp', [
    'ngResource',
    'ui.router',
    'controllers',
    'services',
    'directives',
    'ngSanitize'
]);
app.run(['$rootScope', '$state', '$stateParams', function ($rootScope, $state, $stateParams) {
    $rootScope.$on("$stateChangeError", console.log.bind(console));

    //Save a copy of the parameters so we can access them from all the controllers
    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;
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
        })
        .state('register',{
            url:'/register',
            views:{
                navbar:{
                    templateUrl:"components/navbar/navbarView.html",
                    controller:"navbarController"
                },
                content:{
                    templateUrl:"components/register/registerView.html",
                    controller:"registerController"
                }
            }
        })
        .state('manage',{
            url:'/manage',
            views:{
                navbar:{
                    templateUrl:"components/navbar/navbarView.html",
                    controller:"navbarController"
                },
                content:{
                    templateUrl:"components/manage/manageView.html",
                    controller:"manageController"
                }
            }
        })
}]);

angular.module('controllers',['ngAnimate','mgcrea.ngStrap']);
angular.module('directives',['ngAnimate','mgcrea.ngStrap']);
angular.module('services',[]);