open Dream

let will_stop, stop_now = Lwt.wait ()

let signal_handler s =
  log "Exiting on signal %d" s;
  Lwt.wakeup stop_now ()

let _ = Lwt_unix.on_signal 15 signal_handler
let _ = Lwt_unix.on_signal 2 signal_handler

let level =
  match Settings.debug with
  | true -> `Debug
  | false -> `Info

let () = initialize_log ~level ()
let log = Dream.sub_log "server"

let () =
  List.iter (fun src ->
      match Logs.Src.name src with
      | "cohttp.lwt.io" | "cohttp.lwt.server" | "tls.tracing" | "tls.config" -> Logs.Src.set_level src None
      | _ -> ())
  @@ Logs.Src.list ()

let loader root path _request =
  match Static_filesystem.read (root ^ "/" ^ path) with
  | None -> Dream.empty `Not_Found
  | Some asset -> Dream.respond asset

let default_handler _req =
  let uscito, giorni_fa, data_italiano, ep_num, titolo, msg_risposta_no = Joypad_monitor.elabora_risposta () in
  Dream.html (Views.index uscito giorni_fa data_italiano ep_num titolo msg_risposta_no)

let joycord_json_tree : string option ref = ref None

let store_joycord_json_tree req =
  let%lwt json = Dream.body req in
  joycord_json_tree := Some json;
  Dream.json "{ \"status\": \"ok\" }"

let get_joycord_json_tree _req =
  match !joycord_json_tree with
  | None -> Dream.json "[]"
  | Some json -> Dream.json json

let server =
  Lwt.async Joypad_monitor.monitor (* TODO ELIMINARE Lwt.async *);
  Lwt.async (Utils.gc_loop Settings.gc_period_sec) (* TODO ELIMINARE Lwt.async *);

  serve
    ~interface:Settings.listen_address
    ~port:Settings.listen_port
    ~error_handler:Dream.debug_error_handler (* TODO BOH... come si disattiva 'sto coso? *)
    ~stop:will_stop
  @@ logger
  @@ (if Settings.debug then Dream.no_middleware else Dream.origin_referrer_check)
  @@ (if Settings.debug then Middlewares.Cors.middleware else Dream.no_middleware)
  @@ (if Settings.debug then Middlewares.Json_debug.middleware ~log else Dream.no_middleware)
  @@ Middlewares.No_trailing_slash.middleware
  @@ Dream.sql_pool Settings.django_connection_string
  @@ router
       [
         get "/assets/**" @@ static ~loader "/assets";
         get "/static/joypad-img.jpg" @@ static ~loader "";
         get "/static/apple-touch-icon.png" @@ static ~loader "";
         get "/e-uscito-joypad.css" @@ static ~loader "";
         get "/joypad-img.jpg" @@ static ~loader "";
         get "/favicon-16x16.png" @@ static ~loader "";
         get "/favicon-32x32.png" @@ static ~loader "";
         get "/favicon.ico" @@ static ~loader "";
         get "/api/ultima-puntata" (fun _r ->
             let uscito, giorni_fa, data_italiano, ep_num, titolo, msg_risposta_no =
               Joypad_monitor.elabora_risposta ()
             in
             let dati = Joypad_monitor.{ uscito; giorni_fa; data_italiano; ep_num; titolo; msg_risposta_no } in
             Joypad_monitor.dati_ultima_puntata_to_yojson dati |> Yojson.Safe.to_string |> Dream.json);
         get "/api/last-episodes/:num/:offset" (fun r -> Rest.decorator r Rest.Last_episodes.view);
         get "/api/search-game/:searchInput" (fun r -> Rest.decorator r Rest.Search_game.view);
         get "/api/search-game-title/:searchInput" (fun r -> Rest.decorator r Rest.Search_game_title.view);
         get "/api/episodes-by-game-id/:gameId" (fun r -> Rest.decorator r Rest.Episodes_by_game_id.view);
         post "/api/joycord/channels" store_joycord_json_tree;
         get "/api/joycord/channels" get_joycord_json_tree;
         get "/api/joycord/games-for-score.tsv" (fun r -> Dream.sql r (Rest.Games_for_score.view r));
         get "/se-ne-parla-qui/:selectedGameIdUrl/:searchInputUrl" default_handler;
         get "/joycord/channels" default_handler;
         get "/sitemap.xml" (fun r -> Dream.sql r (Sitemap.view r));
         get "/" default_handler;
       ]

let () = Lwt_main.run server
