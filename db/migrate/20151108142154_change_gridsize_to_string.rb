class ChangeGridsizeToString < ActiveRecord::Migration
  def change
  	change_column :games, :gridsize, :string
  end
end
