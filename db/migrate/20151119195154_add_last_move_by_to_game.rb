class AddLastMoveByToGame < ActiveRecord::Migration
  def change
    add_column :games, :last_move, :integer
  end
end
