import './App.css';
import { useState, useRef, useEffect } from 'react';
import FrameBox from './components/FrameBox';
import UserFrameBox from './components/UserFrameBox';
import FBLoading from './components/FBLoading';
import { saveAs } from 'file-saver';

const JSZip = require("jszip");

function App() {
  const [uploadedVideo, setUploadedVideo] = useState(null);
  const [frameBoxFrames, setFrames] = useState([]);
  const [userSelectedFrames, setUserSelectedFrames] = useState([]);
  const [frameRate, setFrameRate] = useState(1);
  const [framesAfterCurrent, setFramesAfterCurrent] = useState(true);
  const [gettingFrames, setGettingFrames]  = useState(false)

  const videoRef = useRef(null);
  const hiddenVideoRef = useRef(null);

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  const handleFileChange = (e) => {
      const file = e.target.files[0];
      const fileURL = URL.createObjectURL(file);
      setUploadedVideo(fileURL);
      
  };

  const handleFrameDirectionChange = (isChecked) => {
    setFramesAfterCurrent(isChecked);
  };

  const handleFrameRateChange = (value) => {
    setFrameRate(value);
    document.getElementById("frameRateDisplay").innerText = `${value} fps`;
  };

  const handleFrameSelection = (selectedFrame) => {
    console.log("Frame clicked")
    setUserSelectedFrames(prevFrames => [...prevFrames, selectedFrame]);
  };

  const handleFrameRemoval = (frameToRemove) => {
    setUserSelectedFrames(prevFrames => prevFrames.filter(frame => frame !== frameToRemove));
  };

  const handleZipDownload = () => {

    if(!userSelectedFrames.length){
      alert("No frames selected");
      return;
    }

    var zip = new JSZip();

    userSelectedFrames.forEach((base64Data, index) => {
      const fileName = `image${index + 1}.png`;
      zip.file(fileName, base64Data.split(",")[1], {base64: true});
    });

    zip.generateAsync({type:"blob"})
    .then(function(content) {
        saveAs(content, "reference_frames.zip");
    }).catch(function(error) {
      console.error("Error generating zip:", error);
    });;
  }


  
  useEffect(() => {
    console.log("Use effect triggered");

    const captureFrame = (vidref) => {
      if (vidref && vidref.readyState >= 2) { // Ensure video data is available
          canvas.width = vidref.videoWidth;
          canvas.height = vidref.videoHeight;
          ctx.drawImage(vidref, 0, 0, canvas.width, canvas.height);
          const dataURL = canvas.toDataURL('image/png');
          return dataURL;
      }
      return null;
    }

    const captureAroundPaused = () => {
      const video = videoRef.current;
      const hiddenVideo = hiddenVideoRef.current;
      const currentTime = video.currentTime;
      let intervals = 
          framesAfterCurrent ? 
          Array.from({ length: 18 }, (_, i) => i) 
        : Array.from({ length: 18 }, (_, i) => i - 9);
    
      console.log(frameRate)
      console.log(intervals)
      const frames = [];
    
      const captureAtTime = (time) => {
        return new Promise((resolve) => {
          hiddenVideo.currentTime = time;
    
          hiddenVideo.onseeked = function() {
            frames.push(captureFrame(hiddenVideo));
            resolve();
          };
        });
      };
    
      let promiseChain = Promise.resolve();
      for (let i = 0; i < intervals.length; i++) {
        promiseChain = promiseChain.then(() => {
          return captureAtTime(currentTime + intervals[i] * (1/frameRate));
        });
      }
      return promiseChain.then(() => frames);
    }    

    const handlePause = () => {
      setGettingFrames(true);
    
      captureAroundPaused()
        .then(frameArray => {
          setFrames(frameArray);
          setGettingFrames(false);
        })
        .catch(error => {
          console.error("Error capturing frames: ", error);
          setGettingFrames(false); //in case of errors so the feedback doesn't get stuck.
        });
    };

    if (uploadedVideo && videoRef.current) {
        var vidref = videoRef.current
        vidref.addEventListener('pause', handlePause);
        vidref.addEventListener('seeked', handlePause);

        //Remove the event listener to prevent duplicates
        return () => {
            vidref.removeEventListener('pause', handlePause);
            vidref.removeEventListener('seeked', handlePause);
        };
    }
  }, [uploadedVideo, frameRate, framesAfterCurrent]);


  return (
    <div className="App">
      {uploadedVideo ? <></> : <p>Upload a video to get started</p>}
      <input className='fileUpload' type="file" accept="video/*" onChange={handleFileChange} />
      {
        uploadedVideo &&
        <div className="playerWrapper">

          <div className="hiddenPlayer">
            {
              uploadedVideo
              &&
              <video ref={hiddenVideoRef} src={uploadedVideo} style={{ display: 'none' }} preload="auto" />
            }
          </div>

          <div className="Player">
            {
              uploadedVideo 
              && 
              <video ref={videoRef} src={uploadedVideo} controls width="600">
                Your browser does not support the video tag.
              </video> 
            }
          </div>

          <div>
            {
              uploadedVideo &&
              <div className='controlBox'>
                <div>
                  <label htmlFor="frameRate">Displayed Frame Rate: </label>
                  <input
                    type="range"
                    id="frameRate"
                    name="frameRate"
                    min="1"
                    max="24"
                    defaultValue="1"
                    onChange={(e) => handleFrameRateChange(e.target.value)}
                  />
                  <span id="frameRateDisplay">1 fps</span>
                </div>

                <div>
                  <label htmlFor="frameDirection">Start at current frame: </label>
                  <input
                    type="checkbox"
                    id="frameDirection"
                    name="frameDirection"
                    defaultChecked={true}
                    onChange={(e) => handleFrameDirectionChange(e.target.checked)}
                  />
                </div>

                <button className="downloadButton" onClick={handleZipDownload}>
                  Download Selected Frames
                </button>
              </div> 
              }

          </div>
        </div>
      }
      {
        gettingFrames ? 
        <FBLoading /> :
        uploadedVideo && <FrameBox frameArray={frameBoxFrames} onFrameClick={handleFrameSelection}/> 
      }


      {
        userSelectedFrames.length === 0 ?
        uploadedVideo && <UserFrameBox frameArray={[]} /> :
        uploadedVideo && <UserFrameBox frameArray={userSelectedFrames} onRemoveClick={handleFrameRemoval} />
      }

    </div>
  );
}

export default App;
