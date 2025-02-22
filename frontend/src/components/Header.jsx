import { useState, useEffect } from "react";
import { useMediaQuery } from "react-responsive";
import Message from "./Header/Message";
import HeroLinks from "./Header/HeroLinks";
import Logo from "./Header/Logo";

export default function Header () {
  const [datiUltimaPuntata, setDatiUltimaPuntata] = useState({});
  const isMobile = useMediaQuery({ query: "(max-width: 920px)" });

  useEffect(() => {
    fetch("/api/ultima-puntata")
      .then((response) => response.json())
      .then((data) => {
        setDatiUltimaPuntata(data);
      });
  }, []);

  const style = isMobile
    ? {
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        height: "605px",
      }
    : {};

  return (
    <header style={style}>
      <Logo />
      <div
        style={
          !isMobile
            ? {
                display: "flex",
                flexDirection: "row",
                margin: "0 auto",
                width: "91.9rem",
                justifyContent: "space-between",
              }
            : {}
        }
      >
        <Message dati={datiUltimaPuntata} />
        <HeroLinks />
      </div>
    </header>
  );
};