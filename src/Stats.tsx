import React from 'react';
import smiley from "./images/smiley.png";
import smileywin from "./images/smiley-win.png";
import smileylose from "./images/smiley-lose.png";

const Stats: React.FC<IStatsProps> = (props) => 
{
  let smileyIcon = props.gameStatus === "won" ? smileywin :
      props.gameStatus === "lost" ? smileylose : smiley;

  return (
    <div className="stats">
      <div className="mine-count">{props.mineCount}</div>
      <div className="new-game">
          <img src={smileyIcon} alt="New game" onClick={props.onNewGame}></img>
      </div>
      <div className="timer">{props.timer}</div>
      <div className="clear"></div>
    </div>
  );
}

export default Stats;