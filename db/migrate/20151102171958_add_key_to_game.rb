class AddKeyToGame < ActiveRecord::Migration
  def change
    add_column :games, :key, :string
  end
end
