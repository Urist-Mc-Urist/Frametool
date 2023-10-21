import React from 'react';

const UserFrameBox = ({frameArray, onRemoveClick}) => {


  const renderFrames = () => {
    if (frameArray.length === 0) {
      // Render grey squares
      return Array.from({ length: 6}).map((_, index) => (
        <div className='frameTN' key={index} style={{ backgroundColor: 'grey', width: "10%", minWidth: "15%", height: "112px", flexShrink: 0 }}></div>
      ));
    } else {
      // Render images
      return frameArray.map((imageSrc, index) => (
        <div className ="frameContainer" key={index}>
          <img 
            className='frameTN'
            src={imageSrc} 
            alt={`Frame ${index}`}
          />
          { 
            onRemoveClick && 
            <img 
              src="x.svg" 
              className="removeButton" 
              alt="Remove" 
              onClick={() => onRemoveClick(imageSrc)} 
            /> 
          }
        </div>     
      ));
    }
  };

  return (
    <div className='FrameBox'>
      <div className="frameWrapper">
        { renderFrames() }
      </div>
    </div>
  );
};

export default UserFrameBox;