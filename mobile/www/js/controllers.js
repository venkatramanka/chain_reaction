'use strict';

angular.module('starter.controllers',['ionic','ui.router', 'entangled'])

.controller('MainCtrl', function($scope, $http, $state, $rootScope) {
  //var gameUrl = $resource("");
  $scope.startGame = function(profile) {
    $http({
        url: "http://192.168.42.141:3000/games/play",
        method: "post",
        data: {"name" : profile.name, "gridsize": profile.gridsize, "color": profile.colour}
    }).then(function(response) {
        // The then function here is an opportunity to modify the response
        // The return value gets picked up by the then in the controller.
        //alert(response.data['action']);
        $scope.Math = window.Math;
        $rootScope.key = response.data['key'];
        $rootScope.gameId = parseInt(response.data['game_id']);
        $rootScope.playerId = parseInt(response.data['player_id']);
        $rootScope.colour = profile.colour;
        $rootScope.from = 'create_game';
        $rootScope.gridsize = profile.gridsize;
        var colors = ["Red", "Green", "Blue", "Orange"];
        var pl1Color = colors.indexOf(profile.colour);
        $rootScope.opponentColor = colors[(pl1Color+1)%4];
        $state.go('tab.game', {});
    });
    // gameUrl.get({name : profile.name, gridsize: profile.gridsize, color: profile.colour},function(response){
    //   alert(response.data);
    // });
  };
})

.controller('JoinCtrl', function($scope, $http, $rootScope, $state) {

  $scope.joinGame = function(profile) {
    $http({
        url: "http://192.168.42.141:3000/games/play",
        method: "post",
        data: {"name" : profile.name, "key": profile.key}
    }).then(function(response) {
        // The then function here is an opportunity to modify the response
        // The return value gets picked up by the then in the controller.
        $rootScope.key = response.data['key'];
        $rootScope.gameId = parseInt(response.data['game_id']);
        $rootScope.playerId = parseInt(response.data['player_id']);
        $rootScope.colour = response.data['color'];
        $rootScope.from = 'join_game';
        $rootScope.gridsize = response.data['gridsize'];
        var colors = ['Red','Green','Blue','Orange']
        var pl1Color = colors.indexOf(response.data['color']);
        $rootScope.opponentColor = colors[(pl1Color-1)%4];
        $state.go('tab.game', {});
    });
    // gameUrl.get({name : profile.name, gridsize: profile.gridsize, color: profile.colour},function(response){
    //   alert(response.data);
    // });
  };
})

.controller('GameCtrl', function($scope, $state, $stateParams, $ionicLoading, Game, $rootScope, $http) {
    $scope.Math = window.Math;
    $scope.game = Game.new();
    $rootScope.cancel = $ionicLoading.hide;
    if($rootScope.from == 'create_game'){
        $ionicLoading.show({
            template: 'Waiting for your opponent to join. Pass on this game ID : ' + $rootScope.key,
            animation: 'fade-in',
            showBackdrop: true,
            maxWidth: 200,
            showDelay: 0
        });
    }
    else if($rootScope.from == 'join_game'){
        $ionicLoading.show({
            template: 'Wait for your turn..',
            animation: 'fade-in',
            showBackdrop: true,
            maxWidth: 200,
            showDelay: 0
        });
    }

    Game.find($rootScope.gameId, function(err, game) {
      if (!err) {
        $scope.$apply(function() {
            if(game.lastMove != null && game.lastMove != $rootScope.playerId){
                if(game.winner != null){
                    $ionicLoading.hide();
                    alert("Oops! You've lost the game");
                    $state.go('tab.main', {});
                    $ionicHistory.clearHistory();
                    setTimeout(function (){
                        $window.location.reload(true);
                    }, 100);
                }
                else if(game.lastTouch != null){
                    rotateGridAndMove(parseInt(game.lastTouch.split("-")[0]), parseInt(game.lastTouch.split("-")[1]), $rootScope.opponentColor, $scope.rowsize, $scope.colsize, $scope.game.positions, 'opponent', 360).then(hideLoading(parseInt(game.lastTouch.split("-")[0]), parseInt(game.lastTouch.split("-")[1])));
                    $scope.game = game;
                }
                else{
                    $ionicLoading.hide();
                }
                
            }
            else{
                $scope.game = game;
            }
        });
      }
    });

    function rotateGridAndMove(row, col, colour, rowsize, colsize, positions, type, angle){
        var d = new jQuery.Deferred();
        //jQuery('.gridCol').rotate({ animateTo: angle, duration: 2000 });
        jQuery('.grid').addClass('jello');
        jQuery('#'+row+'-'+col).addClass('tada');
        propagateMove(row, col, colour, rowsize, colsize, positions, type);
        d.resolve();
        return d.promise();
    }

    function hideLoading(row, col){
        var d = new jQuery.Deferred();
        jQuery('.grid').removeClass('jello');
        jQuery('#'+row+'-'+col).addClass('tada');
        $ionicLoading.hide();
        d.resolve();
        return d.promise();
    }
    
    $scope.got_key = true;
    $scope.key = $rootScope.key;
    $scope.gridsize = $rootScope.gridsize;

    if($scope.gridsize == 'Small'){
        $scope.rowsize = 9;
        $scope.colsize = 6;
    }
    else if($scope.gridsize == 'Medium'){
        $scope.rowsize = 12;
        $scope.colsize = 10;
    }
    else{
        $scope.rowsize = 15;
        $scope.colsize = 12;
    }

    function propagateMove(row, col, colour, rowsize, colsize, positions, type){
        if(positions['['+row+', '+col+']']["type"] == "corner"){
            if(positions['['+row+', '+col+']']["count"] == null || positions['['+row+', '+col+']']["count"] == 0){
                $scope.game.positions['['+row+', '+col+']']["count"] = positions['['+row+', '+col+']']["count"] = 1;
                $scope.game.positions['['+row+', '+col+']']["color"] = positions['['+row+', '+col+']']["color"] = colour;
                jQuery('#'+row+'-'+col).delay(0).queue(function(n) { jQuery(this).html(jQuery("<div class='circ single_circle'><div class='circ circle "+colour+"' height:80%;width:80%' ></div></div>")); n(); });
            }
            else{
                jQuery('#'+row+'-'+col).delay(0).queue(function(n) { jQuery(this).html(''); n(); });
                $scope.game.positions['['+row+', '+col+']']["count"] = positions['['+row+', '+col+']']["count"] = 0;
                $scope.game.positions['['+row+', '+col+']']["color"] = positions['['+row+', '+col+']']["color"] = null;
                if(row == 0 && col == 0){
                    propagateMove(0,1,colour,rowsize,colsize,positions,type);
                    propagateMove(1,0,colour,rowsize,colsize,positions,type);
                }
                else if(row == 0 && col == colsize-1){
                    propagateMove(0,col-1,colour,rowsize,colsize,positions,type);
                    propagateMove(1,col,colour,rowsize,colsize,positions,type);   
                }
                else if(row == rowsize-1 && col == 0){
                    propagateMove(row,1,colour,rowsize,colsize,positions,type);
                    propagateMove(row-1,0,colour,rowsize,colsize,positions,type);
                }
                else if(row == rowsize-1 && col == colsize-1){
                    propagateMove(row,col-1,colour,rowsize,colsize,positions,type);
                    propagateMove(row-1,col,colour,rowsize,colsize,positions,type);
                }
            }
        }
        else if(positions['['+row+', '+col+']']["type"] == "edge"){
            if(positions['['+row+', '+col+']']["count"] == null || positions['['+row+', '+col+']']["count"] == 0){
                $scope.game.positions['['+row+', '+col+']']["count"] = positions['['+row+', '+col+']']["count"] = 1;
                $scope.game.positions['['+row+', '+col+']']["color"] = positions['['+row+', '+col+']']["color"] = colour;
                jQuery('#'+row+'-'+col).delay(0).queue(function(n) { jQuery(this).html(jQuery("<div class='circ single_circle'><div class='circ circle "+colour+"' height:80%;width:80%' ></div></div>")); n(); });
            }
            else if(positions['['+row+', '+col+']']["count"] == 1){
                $scope.game.positions['['+row+', '+col+']']["count"] = positions['['+row+', '+col+']']["count"] = 2;
                $scope.game.positions['['+row+', '+col+']']["color"] = positions['['+row+', '+col+']']["color"] = colour;
                jQuery('#'+row+'-'+col).delay(0).queue(function(n) { jQuery(this).html(jQuery("<div class='circ double_circle spinning'><div class='circle spinning "+colour+"' height:80%;width:50%></div><div class='circle spinning "+colour+"' height:80%;width:50%></div></div>")); n(); });
            }
            else{
                jQuery('#'+row+'-'+col).delay(0).queue(function(n) { jQuery(this).html(''); n(); });
                $scope.game.positions['['+row+', '+col+']']["count"] = positions['['+row+', '+col+']']["count"] = 0;
                $scope.game.positions['['+row+', '+col+']']["color"] = positions['['+row+', '+col+']']["color"] = null;
                if(row == 0){
                    propagateMove(0,col-1,colour,rowsize,colsize,positions,type);
                    propagateMove(0,col+1,colour,rowsize,colsize,positions,type);
                    propagateMove(row+1,col,colour,rowsize,colsize,positions,type);
                }
                else if(row == rowsize-1){
                    propagateMove(row,col-1,colour,rowsize,colsize,positions,type);
                    propagateMove(row,col+1,colour,rowsize,colsize,positions,type);
                    propagateMove(row-1,col,colour,rowsize,colsize,positions,type);
                }
                else if(col == 0){
                    propagateMove(row-1,col,colour,rowsize,colsize,positions,type);
                    propagateMove(row+1,col,colour,rowsize,colsize,positions,type);
                    propagateMove(row,col+1,colour,rowsize,colsize,positions,type);
                }
                else if(col == colsize-1){
                    propagateMove(row-1,col,colour,rowsize,colsize,positions,type);
                    propagateMove(row+1,col,colour,rowsize,colsize,positions,type);
                    propagateMove(row,col-1,colour,rowsize,colsize,positions,type);
                }
            }
        }
        else{
           if(positions['['+row+', '+col+']']["count"] == null || positions['['+row+', '+col+']']["count"] == 0){
                $scope.game.positions['['+row+', '+col+']']["count"] = positions['['+row+', '+col+']']["count"] = 1;
                $scope.game.positions['['+row+', '+col+']']["color"] = positions['['+row+', '+col+']']["color"] = colour;
                jQuery('#'+row+'-'+col).delay(0).queue(function(n) { jQuery(this).html(jQuery("<div class='circ single_circle'><div class='circ circle "+colour+"' height:80%;width:80%' ></div></div>")); n(); });
            }
            else if(positions['['+row+', '+col+']']["count"] == 1){
                $scope.game.positions['['+row+', '+col+']']["count"] = positions['['+row+', '+col+']']["count"] =2;
                $scope.game.positions['['+row+', '+col+']']["color"] = positions['['+row+', '+col+']']["color"] = colour;
                jQuery('#'+row+'-'+col).delay(0).queue(function(n) { jQuery(this).html(jQuery("<div class='circ double_circle'><div class='circle "+colour+"' height:80%;width:50%></div><div class='circle "+colour+"' height:80%;width:50%></div></div>")); n(); });
            }
            else if(positions['['+row+', '+col+']']["count"] == 2){
                $scope.game.positions['['+row+', '+col+']']["count"] = positions['['+row+', '+col+']']["count"] = 3;
                $scope.game.positions['['+row+', '+col+']']["color"] = positions['['+row+', '+col+']']["color"] = colour;
                jQuery('#'+row+'-'+col).delay(0).queue(function(n) { jQuery(this).html(jQuery("<div class='circ triple_circle spinning' ><div class='circle spinning "+colour+"' height:80%;width:80%></div><div class='circle spinning "+colour+"' height:80%;width:80%></div><div class='circle spinning "+colour+"' height:80%;width:80%></div></div>")); n(); });  
            }
            else{
                jQuery('#'+row+'-'+col).delay(0).queue(function(n) { jQuery(this).html(''); n(); });
                $scope.game.positions['['+row+', '+col+']']["count"] = positions['['+row+', '+col+']']["count"] = 0;
                $scope.game.positions['['+row+', '+col+']']["color"] = positions['['+row+', '+col+']']["color"] = null;
                propagateMove(row-1,col,colour,rowsize,colsize,positions,type);
                propagateMove(row+1,col,colour,rowsize,colsize,positions,type);
                propagateMove(row,col-1,colour,rowsize,colsize,positions,type);
                propagateMove(row,col+1,colour,rowsize,colsize,positions,type);
            } 
        }
    };

    $scope.newMove = function($event, row, col) {
        if($scope.game.positions['['+row+', '+col+']']["color"] == null || $scope.game.positions['['+row+', '+col+']']["color"] == $rootScope.colour){
            rotateGridAndMove(row, col, $rootScope.colour, $scope.rowsize, $scope.colsize, $scope.game.positions, 'self', -360);
            $http({
                url: "http://192.168.42.141:3000/games/update_move",
                method: "post",
                data: {"game_id" : $rootScope.gameId, "player_id": $rootScope.playerId, "cell": row+'-'+col, "positions": $scope.game.positions}
            }).then(function(response) {
                if(response.data == 'won'){
                    alert("Congrats! You've won the game!");
                    $state.go('tab.main',{});
                    $ionicHistory.clearHistory();
                    setTimeout(function (){
                        $window.location.reload(true);
                    }, 100);
                }
                else{
                    $ionicLoading.show({
                    template: 'Wait for your turn..',
                    animation: 'fade-in',
                    showBackdrop: true,
                    maxWidth: 200,
                    showDelay: 0
                    });
                }
            });
        }
    };
    
})

