import React from 'react';
import Square from './Square';

const Board: React.FC<IBoardProps> = (props) => {
    const squares = props.squares.map((square: ISquare, i: number) =>
        <Square
            key={i} 
            value={square} 
            className={i % props.level.width === 0  ? 'break' : ''}
            onClick={() => props.onReveal(i)}
            onContextMenu={() => props.onFlag(i)}
        ></Square>
    );

    return (
      <div className="board">
          {squares}
          <div className="clear"></div>
      </div>
    );
}

export default Board;