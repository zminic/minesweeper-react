import React from 'react';
import Square from './Square';

const Board: React.FC<IBoardProps> = (props) => {
    const squares = [];

    for (let i = 0; i < props.squares.length; i++)
    {      
        squares.push(<Square
            key={i} 
            value={props.squares[i]} 
            className={i % props.level.width === 0  ? 'break' : ''}
            onClick={() => props.onReveal(i)}
            onContextMenu={() => props.onFlag(i)}
            ></Square>);
    }

    return (
      <div className="board">
          {squares}
          <div className="clear"></div>
      </div>
    );
}

export default Board;