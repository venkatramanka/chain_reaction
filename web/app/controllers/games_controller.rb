require 'securerandom'

class GamesController < ApplicationController
  include Entangled::Controller
  def play
  	key = params[:key]
    response_data = {}
  	if(key.nil?)
  		random_string = SecureRandom.urlsafe_base64(5)
      p params
  		game = Game.create(gridsize: params[:gridsize], positions: blank_positions(params[:gridsize]), key: random_string)
  		player = Player.create(name: params[:name], color: params[:color], status: 'waiting for opponent', game_id: game.id)
      response_data = {key: random_string, action: 'wait', player_id: player.id, game_id: game.id}
    else
  		game = Game.find_by_key(key)
      player1 = game.players.first
      puts ['Red','Blue','Green'].index(player1.color)
      color = ['Red','Blue','Green'][(['Red','Blue','Green'].index(player1.color)+1)%3]
  		player = Player.create(name: params[:name], color: color, status: 'joining', game_id: game.id)
      game.update_attribute('last_move', player.id)
  		response_data = {color: color, action: 'wait', player_id: player.id, game_id: game.id, gridsize: game.gridsize}
  	end
  	#render json: {key: random_string, action: action}
    render json: response_data
  end

  def update_move
    game = Game.find(params[:game_id])
    player = Player.find(params[:player_id])
    game.last_move = params[:player_id]
    game.last_touch = params[:cell]
    game.positions = params[:positions]
    game.moves = game.moves.nil? ? 1 : game.moves+1
    # r, c = params[:cell].split("-").map{|a| a.to_i}
    # puts game.positions
    # cell = game.positions[[r, c].to_s]
    # cell[:color] = player.color
    # if(cell[:type] == 'corner')
    #   cell[:count] = (cell[:count].nil? || cell[:count] == 0) ? 1 : 0
    # elsif(cell[:type] == 'edge')
    #   cell[:count] = (cell[:count].nil? || cell[:count] == 0) ? 1 : ((cell[:count] == 1) ? 2 : 0)
    # elsif(cell[:type] == 'inner')
    #   cell[:count] = (cell[:count].nil? || cell[:count] == 0) ? 1 : ((cell[:count] == 1) ? 2 : ((cell[:count] == 2) ? 3 : 0))
    # end
    # game.positions[[r, c].to_s][:count] = cell[:count]
    # game.positions[[r, c].to_s][:color] = player.color
    game.winner = params[:player_id] if (game.positions.collect{|x| x[1][:color]}.compact.uniq.size == 1 && game.moves > 2)
    game.save
    render text: ((game.winner == params[:player_id]) ? 'won' : 'continue')
  end

  def drop_game
    game = Game.find(params[:game_id])
    unless game.nil?
      players = game.players
      players.first.destroy
      players.second.destroy
      game.destroy
    end
  end

   def index
    broadcast do
      @games = Game.all
    end
  end

  def show
    broadcast do
      @game = Game.find(params[:id])
    end
  end

  def create
    broadcast do
      @game = Game.create(message_params)
    end
  end

  def update
    broadcast do
      @game = Game.find(params[:id])
      @game.update(message_params)
    end
  end

  def destroy
    broadcast do
      @game = Game.find(params[:id]).destroy
    end
  end

  # def custom_action
  #   broadcast do
  #     # do whatever
  #   end
  # end

  private

    def blank_positions(gridsize)
      positions = {}
      if gridsize == 'Small'
        rows = 9
        cols = 6
      elsif gridsize == 'Medium'
        rows = 12
        cols = 10
      else
        rows = 15
        cols = 12
      end
      rows.times do |i|
        cols.times do |j|
          if (i == 0 && j == 0) || (i == 0 && j == cols-1) || (i == rows-1 && j == 0) || (i == rows-1 && j == cols-1)
            positions[[i,j]] = {color: nil, count: nil, type: 'corner'}
          elsif(i == 0 || j == 0 || i == rows-1 || j == cols-1)
            positions[[i,j]] = {color: nil, count: nil, type: 'edge'}
          else
            positions[[i,j]] = {color: nil, count: nil, type: 'inner'}
          end
        end
      end
      return positions
    end

    def message_params
      # params logic here
    end

end
