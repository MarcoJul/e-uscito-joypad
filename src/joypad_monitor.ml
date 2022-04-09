open Cohttp_lwt_unix

type data = {
  ep_num : int;
  title : string;
  date : Timedesc.Date.t;
}

let log = Dream.sub_log "joypad.monitor"

let body () =
  let%lwt _, body = Client.get (Uri.of_string Settings.joypad_page) in
  let%lwt body = Cohttp_lwt.Body.to_string body in
  Lwt.return body

let date_reg = Re2.create_exn "(\\d\\d) +(...) +(\\d\\d\\d\\d) +(?:-|—) +(\\d+) +min"

let extract_date desc =
  (* Esempio di data.desc: "09 Apr 2022 - 42 min" *)
  let matches = Re2.find_submatches_exn date_reg desc in
  let day = matches.(1) |> Utils.option_value |> int_of_string in
  let month = matches.(2) |> Utils.option_value |> Utils.int_of_italian_month in
  let year = matches.(3) |> Utils.option_value |> int_of_string in
  Timedesc.Date.of_iso8601_exn (Utils.spf "%04d-%02d-%02d" year month day)

let title_reg = Re2.create_exn "Ep\\. +(\\d+) +(?:–|—) +(.*)"

let extract_ep_num_and_title data_title =
  (* "Ep. 47 – Quello con Elden Ring, il nuovo Monkey Island e il PlayStation Plus Extra Premium toppissimo" *)
  let m = Re2.find_submatches_exn title_reg data_title in
  let ep_num = m.(1) |> Utils.option_value |> int_of_string in
  let title = m.(2) |> Utils.option_value in
  (ep_num, title)

let extract_data_from_page () =
  let open Soup in
  let%lwt body = body () in
  let soup = parse body in
  let maybe_a = soup $$ "div.ilpostPodcastList div a.play" |> first in
  match maybe_a with
  | Some a ->
    let data_title = attribute "data-title" a |> Option.value ~default:"" in
    let data_desc = attribute "data-desc" a |> Option.value ~default:"" in
    log.debug (fun l -> l "data_title = %s" data_title);
    log.debug (fun l -> l "data_desc = %s" data_desc);
    Lwt.return (data_title, data_desc)
  | None -> failwith "TODO: MANCANO I DATI"

let elabora_risposta last_episode_data =
  match last_episode_data with
  | Some last_episode_data ->
    let tz = Timedesc.Time_zone.make_exn "Europe/Rome" in
    let adesso = Timedesc.now ~tz_of_date_time:tz () in
    let oggi = Timedesc.date adesso in
    let giorni_passati = Timedesc.Date.diff_days oggi last_episode_data.date in
    let uscito = if giorni_passati <= 14 then true else false in
    let giorni_fa = Utils.distanza giorni_passati in
    let data_italiano = Utils.string_of_date last_episode_data.date in
    let fretta = if giorni_passati >= 10 && giorni_passati <= 14 then true else false in
    (uscito, fretta, giorni_fa, data_italiano, last_episode_data.ep_num, last_episode_data.title)
  | None -> (false, false, "", "", 1999, "")

let rec monitor ~last_episode_data () =
  log.debug (fun l -> l "Scarico info ultima puntata...");

  let%lwt () =
    try%lwt
      let%lwt data_title, data_desc = extract_data_from_page () in
      let ep_num, title = extract_ep_num_and_title data_title in
      let date = extract_date data_desc in
      let data = { ep_num; title; date } in
      last_episode_data := Some data;
      log.debug (fun l -> l "...fatto!");
      Lwt.return_unit
    with exn ->
      let backtrace = Printexc.get_backtrace () in
      log.error (fun l -> l "Async exception: %s" (Printexc.to_string exn));
      backtrace |> Utils.iter_backtrace (fun s -> log.error (fun l -> l "%s" s));
      Lwt.return_unit
  in

  let%lwt () = Lwt_unix.sleep Settings.monitor_period_sec in
  monitor ~last_episode_data ()