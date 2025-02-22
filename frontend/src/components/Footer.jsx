import classes from "./Footer.module.css";

export default function Footer() {
  
  return (
    <footer className={classes.footer}>
      <p className={classes.note}>
        <span>Nota per gli autori del podcast: il sito è pubblicato gratuitamente e
        con licenza open su</span>
        <a href="https://github.com/pdonadeo/e-uscito-joypad" rel="noreferrer" target="_blank">GitHub</a>
        <span> e potete fare tutte le richieste che volete</span>
        <a href="https://github.com/pdonadeo/e-uscito-joypad/issues" rel="noreferrer" target="_blank">qui</a>.
      </p>
      <p>Copyright © 2025 Paolo Donadeo.</p>
      <p>Rilasciato sotto licenza MIT, vedi
        <a href="https://github.com/pdonadeo/e-uscito-joypad/blob/main/LICENSE" rel="noreferrer" target="_blank">LICENSE.md</a>
      </p>
    </footer>
  );
};