ExUnit.start

Mix.Task.run "ecto.create", ~w(-r FakeLeancloudAuth.Repo --quiet)
Mix.Task.run "ecto.migrate", ~w(-r FakeLeancloudAuth.Repo --quiet)
Ecto.Adapters.SQL.begin_test_transaction(FakeLeancloudAuth.Repo)

