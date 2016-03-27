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
    'ngSanitize'

]);

app.run(['$rootScope', '$state', '$stateParams','$http', function ($rootScope, $state, $stateParams,$http) {
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
        });
}]);

angular.module('controllers',['ngAnimate','mgcrea.ngStrap','ngCookies']);
angular.module('directives',['ngAnimate','mgcrea.ngStrap']);
angular.module('services',[]);