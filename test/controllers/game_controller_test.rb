require 'test_helper'

class GameControllerTest < ActionController::TestCase
  test "should get index" do
    get :index
    assert_response :success
  end

  test "should get play" do
    get :play
    assert_response :success
  end

end
