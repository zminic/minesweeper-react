import React, { Component } from 'react';
import smiley from "./images/smiley.png";
import smileywin from "./images/smiley-win.png";
import smileylose from "./images/smiley-lose.png";

class Stats extends Component<IStatsProps> {
  render() 
  {
    let smileyIcon = this.props.gameStatus === "won" ? smileywin :
        this.props.gameStatus === "lost" ? smileylose : smiley;

    return (
      <div className="stats">
        <div className="mine-count">{this.props.mineCount}</div>
        <div className="new-game">
            <img src={smileyIcon} alt="New game" onClick={this.props.onNewGame}></img>
        </div>
        <div className="timer">{this.props.timer}</div>
        <div className="clear"></div>
      </div>
    );
  }
}

export default Stats;