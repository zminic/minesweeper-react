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
    style: React.CSSProperties
}

interface IGameState
{
    levels: ILevel[];
    gameState: 'new' | 'in-progress' | 'won' | 'lost';
    timeElapsed: number;
    selectedLevel: ILevel;
    squares: ISquare[];
}