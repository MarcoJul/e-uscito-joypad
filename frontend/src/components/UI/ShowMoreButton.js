import classes from "./ShowMoreButton.module.css";

const ShowMoreButton = ({ onClick, limit }) => {
  return (
      <div className={classes.wrapper} onClick={onClick}>
        <button className={classes.button}>
          <span>Ne voglio altri {limit}!</span>
        </button>
      </div>
  );
};

export default ShowMoreButton;
