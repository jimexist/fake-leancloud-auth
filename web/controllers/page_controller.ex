defmodule FakeLeancloudAuth.PageController do
  use FakeLeancloudAuth.Web, :controller

  def index(conn, _params) do
    render conn, "index.html"
  end
end
