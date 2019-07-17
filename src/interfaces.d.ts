interface ISquare
{
    isRevealed: boolean;
    isMine: boolean;
    isFlag: boolean;
    isHighlighted: boolean;
    index: number;
    mineCount: number;
}

interface ILevel
{
    name: string;
    width: number;
    height: number;
    mineCount: number;
}

interface ISquareProps
{
    className: string;
    value: ISquare;
    onContextMenu: (e: React.MouseEvent) => void;
    onClick: (e: React.MouseEvent) => void;
}

interface IBoardProps
{
    squares: ISquare[];
    level: ILevel;
    onReveal: (int) => void;
    onFlag: (int) => void;
}

type GameStatus = 'new' | 'in-progress' | 'won' | 'lost';

interface IGameState
{
    levels: ILevel[];
    gameStatus: GameStatus;
    timeElapsed: number;
    selectedLevel: ILevel;
    squares: ISquare[];
}

interface IStatsProps
{
    mineCount: number;
    timer: number;
    onNewGame: () => void;
    gameStatus: GameStatus;
}

interface ILevelSelectorProps
{
    levels: ILevel[];
    OnLevelSelected: (ILevel) => void;
}