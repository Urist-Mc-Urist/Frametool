import React from 'react';

const FrameBox = ({frameArray, onFrameClick}) => {


  const renderFrames = () => {
    if (frameArray.length === 0) {
      // Render grey squares
      return Array.from({ length: 12}).map((_, index) => (
        <div className='frameTN' key={index} style={{ backgroundColor: 'grey', width: "10%", minWidth: "15%", height: "112px", flexShrink: 0 }}></div>
      ));
    } else {
      // Render images
      return frameArray.map((imageSrc, index) => (
        <img 
          className='frameTN'
          key={index} 
          src={imageSrc} 
          alt={`Frame ${index}`}
          onClick={() => onFrameClick(imageSrc)}  
        />
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

export default FrameBox;