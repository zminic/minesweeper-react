import React, { Component } from 'react';
import "./Board";
import './Game.css';
import Board from './Board';

class Game extends Component<{}, IGameState> {

  private timer: number = 0;

  constructor(props: {})
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
      timeElapsed: 0
    };

    this.state = {
      ...state,
      gameState: "new",
      selectedLevel: state.levels[0],
      squares: this.initSquares(state.levels[0])
    };
  }

  levelSelected(event: React.ChangeEvent<HTMLSelectElement>)
  {
    let level = this.state.levels.find(x => x.name === event.currentTarget.value);

    if (level) this.newGame(level);
  }

  getRandomNumber = (max: number) => Math.floor((Math.random() * 1000) + 1) % max;

  newGame(level: ILevel)
  {
    this.stopTimer();

    this.setState({
      selectedLevel: level,
      squares: this.initSquares(level),
      gameState: "new",
      timeElapsed: 0
    });
  }

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

      if (!squares[index].isMine) {
        squares[index].isMine = true;
        mines++;
      }
    }

    // calculate distances
    for (let i = 0 ; i < squareCount; i++)
    {
      if (!squares[i].isMine)
      {
        squares[i].mineCount = this.getAdjacentFields(level, squares, i).filter(s => s.isMine).length;
      }
    }

    return squares;
  }

  flagSquare(ind: number)
  {
    // allow flagging square only when game is in progress
    if (this.state.gameState != "in-progress") return;

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

    if (this.state.gameState == "new")
    {
      this.setState({ gameState: "in-progress" });
      this.startTimer();
    }
    else if (this.state.gameState != "in-progress") return;

    // skip revealed squares in auto mode
    if (auto && square.isRevealed) return;

    if (square.isMine)
    {
      this.setState({ gameState: "lost" });
      this.stopTimer();
      this.revealBoard();
    }
    else if (square.isRevealed && !auto)
    {
      let fieldsWithFlags = this.getAdjacentFields(level, squares, ind).filter(s => s.isFlag);

      if (square.mineCount === fieldsWithFlags.length)
      {
        this.getAdjacentFields(level, squares, ind).filter(s => !s.isRevealed && !s.isFlag)
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

      // check for game over
      if (squares.filter(s => !s.isRevealed).length === level.mineCount)
      {
        this.setState({ gameState: "won" });
        this.stopTimer();
      }
    }

    this.setState({ squares: squares });
  }

  /**
   * Reveal whole board, used when mine is revealed
   */
  revealBoard()
  {
    const squares = this.state.squares.slice();

    for (let i = 0 ; i < squares.length; i++)
      squares[i].isRevealed = true;

    this.setState({ squares: squares });
  }

  getAdjacentFields(level: ILevel, squares: ISquare[], ind: number)
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

    return result;
  }

  stopTimer = () =>  clearInterval(this.timer);

  startTimer()
  {
    this.stopTimer();

    this.timer = window.setInterval(()=> { 
      this.setState({
        timeElapsed: this.state.timeElapsed + 0.1
      })
     }, 100);
  }

  statusMessage()
  {
      let elapsed = this.state.timeElapsed.toFixed(1);

      switch(this.state.gameState)
      {
        case "new":
        case "in-progress":
            return (<h2>Your time: {elapsed}</h2>);
        case "won":
          return (<h2>Game over! You won! ({elapsed} s)</h2>)
        case "lost":
          return (<h2>Game over! You lost! ({elapsed} s)</h2>)
      }
  }

  render() {

    const levelOptions = [];

    for (var level of this.state.levels)
      levelOptions.push(<option key={level.name} value={level.name}>{level.name}</option>);

    return (
      <div className="game">
        {this.statusMessage() }
        <select onChange={(e) => this.levelSelected(e)}>
          {levelOptions}
        </select>

        <button onClick={() => this.newGame(this.state.selectedLevel)}>New game</button>

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