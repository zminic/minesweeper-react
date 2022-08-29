import React from 'react';

const Stats: React.FC<IStatsProps> = (props) => 
{
  let smileyIcon = props.gameStatus === "won" ? '😎' :
      props.gameStatus === "lost" ? '🙁' : '🙂';

  return (
    <div className="stats">
      <div className="mine-count">{props.mineCount}</div>
      <div className="new-game" onClick={props.onNewGame}>
          <span>{smileyIcon}</span>
      </div>
      <div className="timer">{props.timer}</div>
      <div className="clear"></div>
    </div>
  );
}

export default Stats;