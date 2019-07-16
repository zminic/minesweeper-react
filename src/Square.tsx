import React from 'react';

const Square: React.FC<ISquareProps> = (props) => {

  let classNames = ['square'];

    if (props.className) classNames.push(props.className);

    if (!props.value.isRevealed)
    {
        if (props.value.isFlag) classNames.push('flag');
    }
    else
    {
        classNames.push('revealed');

        if (props.value.isMine) classNames.push('mine');
    }

    let displayValue = props.value.isRevealed && !props.value.isMine && props.value.mineCount !== 0 ? props.value.mineCount : '';

    let onContextMenu = (e: React.MouseEvent) =>
    {
        props.onContextMenu(e);
        e.preventDefault();
    };

  return (
    <button 
        className={classNames.join(' ')} 
        onClick={props.onClick} 
        onContextMenu={onContextMenu}>
        {displayValue}
      </button>
  );
}

export default Square;