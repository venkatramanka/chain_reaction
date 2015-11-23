class Player < ActiveRecord::Base
	attr_accessible :name, :color, :status, :game_id
	belongs_to :game
end
