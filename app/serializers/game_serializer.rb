class GameSerializer < ActiveModel::Serializer
  attributes :id, :gridsize, :positions
end