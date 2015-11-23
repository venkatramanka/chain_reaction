class Game < ActiveRecord::Base
	include Entangled::Model
	serialize :positions
	has_many :players
  	entangle
end
