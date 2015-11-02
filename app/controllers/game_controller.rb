require 'securerandom'

class GameController < ApplicationController
  def index
  	key = params[:key]
  	action = 'wait'
  	if(key.empty?)
  		random_string = SecureRandom.hex
  		game = Game.create(gridsize: params[:gridsize], positions: {}, key: random_string)
  		Player.create(name: params[:name], color: params[:color], status: 'waiting for opponent', game_id: game.id)
  	else
  		game = Game.find_by_key(key)
  		Player.create(name: params[:name], color: 'red', status: 'joining', game_id: game.id)
  		action = 'start'
  	end
  	render json: {key: random_string, action: action}
  end

  def play
  end
end
