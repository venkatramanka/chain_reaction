class CreateGames < ActiveRecord::Migration
  def change
    create_table :games do |t|
      t.integer :gridsize
      t.text :positions

      t.timestamps
    end
  end
end
