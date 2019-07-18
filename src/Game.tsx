import React, { Component } from 'react';
import './Game.css';
import Board from './Board';
import Stats from './Stats';
import LevelSelector from './LevelSelector';

class Game extends Component<{}, IGameState> {

  private timer: number = 0;

  constructor(props: {})
  {
    super(props);

    let state = {
      levels: [{
        name: 'Beginner',
        width: 9,
        height: 9,
        mineCount: 10
      },
      {
        name: 'Intermediate',
        width: 16,
        height: 16,
        mineCount: 40
      },
      {
        name: 'Expert',
        width: 30,
        height: 16,
        mineCount: 99
      }],
      timeElapsed: 0
    };

    this.state = {
      ...state,
      gameStatus: "new",
      selectedLevel: state.levels[0],
      squares: this.initSquares(state.levels[0])
    };
  }

  /** Get random number between 0 and max */
  getRandomNumber = (max: number) => Math.floor((Math.random() * 1000) + 1) % max;

  /**
   * Start new game and initialize all fields
   * @param level 
   */
  newGame(level: ILevel)
  {
    this.stopTimer();

    this.setState({
      selectedLevel: level,
      squares: this.initSquares(level),
      gameStatus: "new",
      timeElapsed: 0
    });
  }

  /** Initialize level (without planting mines, mines are planted on first reveal) */
  initSquares(level: ILevel)
  {
    const squareCount = level.width * level.height;

    let squares = Array(squareCount).fill(null);

    for (let i = 0 ; i < squareCount; i++)
      squares[i] = {
        isRevealed: false,
        isMine: false,
        isFlag: false,
        isHighlighted: false,
        index: i,
        mineCount: 0
      };

    return squares;
  }

  /** Plant mines and calculate distances (this method mutates squares argument) */
  plantMines(level: ILevel, squares: ISquare[], skipIndex: number)
  {
    const squareCount = level.width * level.height;
    let mines = 0;

    // plant mines
    while (mines < level.mineCount)
    {
      var index = this.getRandomNumber(squareCount);

      if (index !== skipIndex && !squares[index].isMine) {
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
  }

  flagSquare(ind: number)
  {
    // allow flagging square only when game is in progress
    if (this.state.gameStatus !== "new" && this.state.gameStatus !== "in-progress") return;

    const squares = this.state.squares.slice();
    const square = squares[ind];

    if (!square.isRevealed)
    {
      square.isFlag = !square.isFlag;

      this.setState({ squares: squares });
    }
  }

  /**
   * Main method for revealing square (doesn't mutate state)
   * @param ind Index of square to reveal
   */
  revealSquare(ind: number)
  {
    const level = this.state.selectedLevel;
    const squares = this.state.squares.slice();

    // start timer and plant mines on first reveal
    if (this.state.gameStatus === "new")
    {
      this.plantMines(level, squares, ind);
      this.startTimer();
      this.setState({ gameStatus: "in-progress" });
    }
    // don't allow reveal if game is not in progress
    else if (this.state.gameStatus !== "in-progress") return;

    this.revealSquareInternal(level, squares, ind, false);

    // update squares after reveal
    this.setState({ squares: squares });
  }

  /**
   * Inner method that mutates squares argument, in this way recursive changes don't have to read and update state every time
   * @param level Current level
   * @param squares Current board
   * @param ind Index of square to reveal
   * @param auto Auto reveal mode
   */
  private revealSquareInternal(level: ILevel, squares: ISquare[], ind: number, auto: boolean = false)
  {
    const square = squares[ind];

    // skip revealed squares in auto mode
    if (auto && square.isRevealed) return;

    // do not reveal flagged square
    if (square.isFlag) return;

    if (square.isMine)
    {
      square.isHighlighted = true;
      this.setState({ gameStatus: "lost" });
      this.stopTimer();
      this.revealMines();
    }
    else if (square.isRevealed && !auto)
    {
      let fieldsWithFlags = this.getAdjacentFields(level, squares, ind).filter(s => s.isFlag);

      if (square.mineCount === fieldsWithFlags.length)
      {
        // auto reveal fields if all mines in adjacent fields are flagged
        this.getAdjacentFields(level, squares, ind).filter(s => !s.isRevealed && !s.isFlag)
          .forEach(s => this.revealSquareInternal(level, squares, s.index, true));
      }
    }
    else
    {
      square.isRevealed = true;
      square.isFlag = false;

      // auto reveal fields that have no mines in adjacent fields
      if (square.mineCount === 0)
        this.getAdjacentFields(level, squares, ind)
          .forEach(s => this.revealSquareInternal(level, squares, s.index, true));

      // check for game over
      if (squares.filter(s => !s.isRevealed).length === level.mineCount)
      {
        this.setState({ gameStatus: "won" });
        this.stopTimer();
      }
    }
  }

  /**
   * Reveal whole board, used when mine is revealed
   */
  revealMines()
  {
    const squares = this.state.squares.slice();

    for (let i = 0 ; i < squares.length; i++)
      if (squares[i].isMine)
        squares[i].isRevealed = true;

    this.setState({ squares: squares });
  }

  /**
   * Return all fields that can be reached from this square
   * @param level Level information
   * @param squares Board representation (array of squares)
   * @param ind Index of current square
   */
  getAdjacentFields(level: ILevel, squares: ISquare[], ind: number)
  {
    const width = level.width;
    const height = level.height;
    const len = width * height;
    let result = [];
    let isFirstColumn = (i: number) => i % width === 0 && i !== 0;
    let isLastColumn = (i: number) => (i + 1) % width === 0 && i !== len - 1;

    // up
    if (ind - width >= 0)
    result.push(squares[ind - width]);

    // down
    if (ind + width < len)
        result.push(squares[ind + width]);

    // left
    if (ind - 1 >= 0 && !isFirstColumn(ind))
        result.push(squares[ind - 1]);

    // right
    if (ind + 1 < len && !isLastColumn(ind))
        result.push(squares[ind + 1]);

    // up left
    if (ind - width - 1 >= 0 && !isFirstColumn(ind - width))
        result.push(squares[ind - width - 1]);

    // up right
    if (ind - width + 1 >= 0 && !isLastColumn(ind - width))
        result.push(squares[ind - width + 1]);

    // bottom left
    if (ind + width - 1 < len && !isFirstColumn(ind + width))
        result.push(squares[ind + width - 1]);

    // bottom right
    if (ind + width + 1 < len && !isLastColumn(ind - width))
        result.push(squares[ind + width + 1]);

    return result;
  }

  stopTimer = () =>  clearInterval(this.timer);

  startTimer()
  {
    this.stopTimer();

    this.timer = window.setInterval(() => { 
      this.setState((state) => ({
        timeElapsed: state.timeElapsed + 1
      }))
     }, 1000);
  }

  getUnflaggedMineCount()
  {
    const level = this.state.selectedLevel;

    return level.mineCount - this.state.squares.filter(s => s.isFlag).length;
  }

  render() {

    const levelOptions = [];

    for (var level of this.state.levels)
      levelOptions.push(<option key={level.name} value={level.name}>{level.name}</option>);

    return (
      <div className="game" style={{width: this.state.selectedLevel.width * 30 + 12}}>
         
        <LevelSelector levels={this.state.levels} OnLevelSelected={(level) => this.newGame(level) }></LevelSelector>

        <Stats mineCount={this.getUnflaggedMineCount()} gameStatus={this.state.gameStatus} timer={this.state.timeElapsed} onNewGame={() => this.newGame(this.state.selectedLevel)} ></Stats>

        <Board 
          squares={this.state.squares} 
          level={this.state.selectedLevel} 
          onReveal={(ind) => this.revealSquare(ind)}
          onFlag={(ind) => this.flagSquare(ind)}
          ></Board>
      </div>
    );
  }
}

export default Game;