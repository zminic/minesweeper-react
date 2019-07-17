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

  /** Level dropdown changed */
  levelSelected(event: React.ChangeEvent<HTMLSelectElement>)
  {
    let level = this.state.levels.find(x => x.name === event.currentTarget.value);

    if (level) this.newGame(level);
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
      gameState: "new",
      timeElapsed: 0
    });
  }

  /**
   * Initialize level (create squares, plant mines, calculate distances)
   * @param level - Level to initialize
   */
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
    if (this.state.gameState !== "new" && this.state.gameState !== "in-progress") return;

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

    // start timer on first reveal
    if (this.state.gameState === "new")
    {
      this.setState({ gameState: "in-progress" });
      this.startTimer();
    }
    // don't allow reveal if game is not in progress
    else if (this.state.gameState !== "in-progress") return;

    // skip revealed squares in auto mode
    if (auto && square.isRevealed) return;

    // do not reveal flagged square
    if (square.isFlag) return;

    if (square.isMine)
    {
      square.isHighlighted = true;
      this.setState({ gameState: "lost" });
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
          .forEach(s => this.revealSquare(s.index, true));
      }
    }
    else
    {
      square.isRevealed = true;
      square.isFlag = false;

      // auto reveal fields that have no mines in adjacent fields
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
          style={{width: this.state.selectedLevel.width * 30}}
          ></Board>
      </div>
    );
  }
}

export default Game;