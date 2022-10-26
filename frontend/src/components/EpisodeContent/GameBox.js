import { Fragment, useState } from "react";
import { useMediaQuery } from "react-responsive";
import classes from "./GameBox.module.css";

import { ReactComponent as IconClose } from "../../icons/ICN_Close.svg";
import ListTransition from "../../CustomHooks/ListTransition";

const GameBox = (props) => {
    const [showGame, setShowGame] = useState(false);
  const isMobile = useMediaQuery({ query: "(max-width: 800px)" });
    const { titolo, speaker, istante, descrizione, cover } = props;

    const minutes = Math.floor(istante / 60);
    const seconds = istante - minutes * 60;

    // const backdrop = ReactDOM.createPortal(
    //   <div className={`${classes.modal} ${showGame ? classes.showModalGame : ""} `}>
    //     <p>{descrizione}</p>
    //   </div>,
    //   document.getElementById("modal")
    // );

    const createDescription = (description) => {
        return { __html: description };
    };

    const showGameHandler = () => {
        setShowGame((previousState) => !previousState);
        document.querySelector("body").style = `overflow: ${!showGame ? "hidden" : "auto"}`;
    };

    return (
        <Fragment>
            <div className={classes.container} onClick={showGameHandler}>
                <div className={classes.textBox}>
                    <h3 className={classes.title}> &rsaquo; {titolo}</h3>
                    <p className={classes.speaker}>
                        <span>speaker</span>: {speaker}
                    </p>
                </div>
                <div className={classes.timeStamp}>
                    <p>
                        {minutes}' {seconds}''
                    </p>
                </div>
            </div>
            <ListTransition>
                {isMobile? 
                <div className={`${classes.modal} ${showGame ? classes.showModalGame : ""} `}>
                    <div className={classes.firstRow} onClick={showGameHandler}>
                        <h2 className={classes.gameTitle}>{titolo}</h2>
                        <div className={classes.closeButton}>
                            <IconClose />
                        </div>
                    </div>
                    <img src={cover} alt={`cover di ${titolo}`} className={classes.gameImage} />
                    <p className={classes.gameDescription} dangerouslySetInnerHTML={createDescription(descrizione)}></p>
                </div>
                : 
                    <div className={`${classes.modal} ${showGame ? classes.showModalGame : ""}`}>
                        <div className={classes.backdrop} onClick={showGameHandler}></div>
                        <div className={classes.modalContent}>
                        <div className={classes.firstRow}>
                        <h2 className={classes.gameTitle}>{titolo}</h2>
                        <div className={classes.closeButton} onClick={showGameHandler}>
                            <IconClose />
                        </div>
                    </div>
                    <img src={cover} alt={`cover di ${titolo}`} className={classes.gameImage} />
                    <p className={classes.gameDescription} dangerouslySetInnerHTML={createDescription(descrizione)}></p>
                        </div>
                </div>
            }
            </ListTransition>
        </Fragment>
    );
};

export default GameBox;
