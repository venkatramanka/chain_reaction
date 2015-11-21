class AddMovesToGame < ActiveRecord::Migration
  def change
    add_column :games, :moves, :integer
  end
end
