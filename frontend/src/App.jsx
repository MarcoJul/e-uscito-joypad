import React, { useState, useEffect } from "react";

import RispostaSi from "./RispostaSi";
import RispostaNo from "./RispostaNo";
import EpisodeSection from "./components/EpisodeSection";

function App() {
  const [datiUltimaPuntata, setDatiUltimaPuntata] = useState({});
  // const [dbData, setDbData] = useState({});

  useEffect(() => {
    fetch("/api/ultima-puntata")
      .then((response) => response.json())
      .then((data) => {
        setDatiUltimaPuntata(data);
      });
  }, []);

  // useEffect(() => {
  //   fetch("/api/db-data")
  //     .then((response) => response.json())
  //     .then((data) => {
  //       setDbData(data);
  //     });
  // }, []);

  console.log(datiUltimaPuntata);

  return (
    <div>
      {datiUltimaPuntata.uscito ? <RispostaSi dati={datiUltimaPuntata} /> : <RispostaNo dati={datiUltimaPuntata} />}

      <p>
        Ascolta la puntata <a href="https://www.ilpost.it/podcasts/joypad/">sulla pagina del Post</a>, sull’
        <a href="https://app.ilpost.it/">app</a> o sulle principali piattaforme:{" "}
        <a href="https://open.spotify.com/show/2JXX6er1IfNvbyPbYPI9tJ">Spotify</a>,{" "}
        <a href="https://podcasts.apple.com/us/podcast/joypad/id1491137742?uo=4">Apple Podcast</a> e{" "}
        <a href="https://www.google.com/podcasts?feed=aHR0cHM6Ly93d3cuc3ByZWFrZXIuY29tL3Nob3cvNDE1MTQyOS9lcGlzb2Rlcy9mZWVk">
          Google Podcast
        </a>
        .
      </p>

      {datiUltimaPuntata.fretta ? <p>Corri! Se aspetti ancora un po' esce il prossimo episodio!</p> : ""}

      <p className="nota">
        Nota per gli autori del podcast: il sito è pubblicato gratuitamente e con licenza open su{" "}
        <a href="https://github.com/pdonadeo/e-uscito-joypad">GitHub</a> e potete fare tutte le richieste che volete{" "}
        <a href="https://github.com/pdonadeo/e-uscito-joypad/issues">qui</a>.
      </p>
      <EpisodeSection />
    </div>
  );
}

export default App;
