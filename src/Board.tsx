import React, { Component } from 'react';
import Square from './Square';

class Board extends Component<IBoardProps> {
  render() 
  {
    const squares = [];

    for (let i = 0; i < this.props.squares.length; i++)
    {      
        squares.push(<Square
            key={i} 
            value={this.props.squares[i]} 
            className={i % this.props.level.dimension === 0  ? 'break' : ''}
            onClick={() => this.props.onReveal(i)}
            onContextMenu={() => this.props.onFlag(i)}
            ></Square>);
    }

    return (
      <div className="board" style={this.props.style}>
          {squares}
          <div className="clear"></div>
      </div>
    );
  }
}

export default Board;