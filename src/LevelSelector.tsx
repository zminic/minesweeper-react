import React from 'react';

const LevelSelector: React.FC<ILevelSelectorProps> = (props) => {

  const levelOptions = [];

  for (var level of props.levels)
    levelOptions.push(<option key={level.name} value={level.name}>{level.name}</option>);

  let onLevelSelected = (e: React.ChangeEvent<HTMLSelectElement>) => 
  {
    let level = props.levels.find(x => x.name === e.currentTarget.value);
    if (level) props.OnLevelSelected(level);
  };

  return (
    <div className="level-selector">
      <span>Level:</span>&nbsp;&nbsp;
      <select onChange={onLevelSelected}>
        {levelOptions}
      </select>
    </div>
  );
}

export default LevelSelector;