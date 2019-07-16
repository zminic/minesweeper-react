import React, { Component } from 'react';
import "./Board";
import './Game.css';
import Board from './Board';

class Game extends Component<{}, IGameState> {
  constructor(props : {})
  {
    super(props);

    let state = {
      levels: [{
        name: 'Easy',
        dimension: 7,
        mineCount: 5
      },
      {
        name: 'Beginner',
        dimension: 9,
        mineCount: 10
      },
      {
        name: 'Intermediate',
        dimension: 12,
        mineCount: 24
      },
      {
        name: 'Advanced',
        dimension: 16,
        mineCount: 60
      }],
      gameOver: false
    };

    this.state = {
      ...state,
      selectedLevel: state.levels[0],
      squares: this.initSquares(state.levels[0])
    };
  }

  levelSelected(event: React.ChangeEvent<HTMLSelectElement>)
  {
    let level = this.state.levels.find(x => x.name === event.currentTarget.value);

    if (level)
    {
      this.setState({
        selectedLevel: level,
        squares: this.initSquares(level)
      });
    }
  }

  getRandomNumber = (max: number) => Math.floor((Math.random() * 1000) + 1) % max;

  initSquares(level: ILevel)
  {
    const squareCount = level.dimension * level.dimension;

    let squares = Array(squareCount).fill(null);

    for (let i = 0 ; i < squareCount; i++)
      squares[i] = {
        isRevealed: false,
        isMine: false,
        isFlag: false,
        index: i,
        mineCount: 0
      };

    // plant mines
    let mines = 0;

    // plant mines
    while (mines < level.mineCount)
    {
      var index = this.getRandomNumber(squareCount);

      if (squares[index] && ! squares[index].isMine) {
        squares[index].isMine = true;
        mines++;
      }
    }

    // calculate distances
    for (let i = 0 ; i < squareCount; i++)
    {
      if (!squares[i].isMine)
      {
        squares[i].mineCount = this.getAdjacentFields(level, squares, i, s => s.isMine).length;
      }
    }

    return squares;
  }

  flagSquare(ind: number)
  {
    const squares = this.state.squares.slice();
    const square = squares[ind];

    if (!square.isRevealed)
    {
      square.isFlag = !square.isFlag;

      this.setState({
        squares: squares
      });
    }
  }

  revealSquare(ind: number, auto: boolean = false)
  {
    const level = this.state.selectedLevel;
    const squares = this.state.squares.slice();
    const square = squares[ind];

    if (auto && square.isRevealed) return;

    if (square.isMine)
    {
      this.revealBoard();
    }
    else if (square.isRevealed && !auto)
    {
      let fieldsWithFlags = this.getAdjacentFields(level, squares, ind, s => s.isFlag);

      if (square.mineCount === fieldsWithFlags.length)
      {
        this.getAdjacentFields(level, squares, ind, s => !s.isRevealed && !s.isFlag)
          .forEach(s => this.revealSquare(s.index, true));
      }
    }
    else
    {
      square.isRevealed = true;
      square.isFlag = false;

      if (square.mineCount === 0)
        this.getAdjacentFields(level, squares, ind)
          .forEach(s => this.revealSquare(s.index, true));
    }

    this.setState({
      squares: squares
    });
  }

  revealBoard()
  {
    const squares = this.state.squares.slice();

    for (let i = 0 ; i < squares.length; i++)
    {
      squares[i].isRevealed = true;
    }

    this.setState({
      squares: squares
    });
  }

  getAdjacentFields(level: ILevel, squares: ISquare[], ind: number, filter?: (s: ISquare) => boolean)
  {
    const dim = level.dimension;
    const len = dim * dim;
    let result = [];
    let isFirstColumn = (i: number) => i % dim === 0 && i !== 0;
    let isLastColumn = (i: number) => (i + 1) % dim === 0 && i !== len - 1;

    // up
    if (ind - dim >= 0)
    result.push(squares[ind - dim]);

    // down
    if (ind + dim < len)
        result.push(squares[ind + dim]);

    // left
    if (ind - 1 >= 0 && !isFirstColumn(ind))
        result.push(squares[ind - 1]);

    // right
    if (ind + 1 < len && !isLastColumn(ind))
        result.push(squares[ind + 1]);

    // up left
    if (ind - dim - 1 >= 0 && !isFirstColumn(ind - dim))
        result.push(squares[ind - dim - 1]);

    // up right
    if (ind - dim + 1 >= 0 && !isLastColumn(ind - dim))
        result.push(squares[ind - dim + 1]);

    // bottom left
    if (ind + dim - 1 < len && !isFirstColumn(ind + dim))
        result.push(squares[ind + dim - 1]);

    // bottom right
    if (ind + dim + 1 < len && !isLastColumn(ind - dim))
        result.push(squares[ind + dim + 1]);

    return filter ? result.filter(filter) : result;
  }

  render() {

    const levelOptions = [];

    for (var level of this.state.levels)
      levelOptions.push(<option key={level.name} value={level.name}>{level.name}</option>);

    return (
      <div className="game">
        <p>Difficulty</p>
        <p>Selected level: {this.state.selectedLevel.name}</p>
        <select onChange={(e) => this.levelSelected(e)}>
          {levelOptions}
        </select>

        <Board 
          squares={this.state.squares} 
          level={this.state.selectedLevel} 
          onReveal={(ind) => this.revealSquare(ind)}
          onFlag={(ind) => this.flagSquare(ind)}
          style={{width: this.state.selectedLevel.dimension * 40}}
          ></Board>
      </div>
    );
  }
}

export default Game;