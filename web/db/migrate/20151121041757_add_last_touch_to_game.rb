class AddLastTouchToGame < ActiveRecord::Migration
  def change
    add_column :games, :last_touch, :string
  end
end
