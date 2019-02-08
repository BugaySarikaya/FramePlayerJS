var player = new FramePlayer('container');

player.on('downloadcomplete', function (ms) {
    console.log('download completed in ' + ms + 'ms');
});

player.on('pause', function (ms) {
    console.log('video is paused');
});

player.on('play', function (ms) {
    console.log('video is playing now');
});

player.on('end', function (ms) {
    console.log('video is completed');
});

function FramePlayer(playerDivId) {
    var playerIndex = 0;
    var playerPaused = true;
    var onDownloadComplete;
    var onPlay;
    var onPause;
    var onEnd;
    var allFrame;


    this.play = function () {
        playerPaused = false;
        if (onPlay) {
            onPlay(playerIndex * 10);
        }
    };

    this.pause = function () {
        playerPaused = true;
        if (onPause) {
            onPause(playerIndex * 10);
        }
    };

    this.on = function (eventType, callback) {
        if (eventType === 'downloadcomplete') {
            onDownloadComplete = callback;
        } else if (eventType === 'play') {
            onPlay = callback;
        } else if (eventType === 'pause') {
            onPause = callback;
        } else if (eventType === 'end') {
            onEnd = callback;
        }
    };

    // add event listener in container

    var container = document.getElementById(playerDivId);
    container.addEventListener("click", function () {
        if (playerPaused === false) {
            playerPaused = true;
            if (onPause) {
                onPause(playerIndex * 10);
            }
        } else {
            playerPaused = false;
            if (onPlay) {
                onPlay(playerIndex * 10);
            }
        }
    }, false);

    // create progressbar

    var progressBuffer = document.createElement("div");
    progressBuffer.id = 'progressBuffer';
    progressBuffer.style.width = '640px';
    progressBuffer.style.height = '24px';
    progressBuffer.style.backgroundColor = 'lightgray';
    progressBuffer.style.cursor = 'pointer';
    progressBuffer.style.boxShadow = '0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)';

    var progressBar = document.createElement("div");
    progressBar.id = 'progressBar';
    progressBar.style.width = '0%';
    progressBar.style.height = '24px';
    progressBar.style.backgroundColor = 'gray';

    var playerInfo = document.createElement("p");
    playerInfo.id = 'playerInfo';

    progressBuffer.appendChild(progressBar);

    // create buttons

    var playBtn = document.createElement("BUTTON");
    var tPlay = document.createTextNode("PLAY");
    playBtn.appendChild(tPlay);
    playBtn.id = 'playButton';
    playBtn.style.backgroundColor = 'dark-grey';
    playBtn.style.color = 'grey';
    playBtn.style.textAlign = 'center';
    playBtn.style.display = 'inline-block';
    playBtn.style.fontSize = '16px';
    playBtn.style.padding = '15px 15px';
    playBtn.style.cursor = 'pointer';
    playBtn.style.marginLeft = '220px';


    var pauseBtn = document.createElement("BUTTON");
    var tPause = document.createTextNode("PAUSE");
    pauseBtn.appendChild(tPause);
    pauseBtn.id = 'pauseButton';
    pauseBtn.style.backgroundColor = 'dark-grey';
    pauseBtn.style.color = 'grey';
    pauseBtn.style.textAlign = 'center';
    pauseBtn.style.display = 'inline-block';
    pauseBtn.style.fontSize = '16px';
    pauseBtn.style.padding = '15px 15px';
    pauseBtn.style.cursor = 'pointer';
    pauseBtn.style.marginLeft = '10px';

    var body = document.getElementsByTagName('body')[0];
    body.appendChild(progressBuffer);
    body.appendChild(playerInfo);
    body.appendChild(playBtn);
    body.appendChild(pauseBtn);

    document.getElementById('progressBuffer').addEventListener("click", function (e) {
        playerPaused = true;
        var xPosition = e.clientX;
        var bufferDiv = document.getElementById('progressBuffer');
        var percentage = (xPosition / (parseInt(bufferDiv.style.width.replace('px', '')))) * 100;
        var frameAtClickedPoint = Math.floor(allFrame.length * (percentage / 100));
        playerIndex = frameAtClickedPoint;
        updatePlayer(container, playerIndex, allFrame);
    }, false);

    document.getElementById('playButton').addEventListener("click", function (e) {
        playerPaused = false;
        if (onPlay) {
            onPlay(playerIndex * 10);
        }
    }, false);

    document.getElementById('pauseButton').addEventListener("click", function (e) {
        playerPaused = true;
        if (onPause) {
            onPause(playerIndex * 10);
        }
    }, false);

    loadImages(function (loadedImages, ms) {
        if (onDownloadComplete) {
            onDownloadComplete(ms);
        }
        extractFramesFromImageArray(loadedImages, function (frames) {
            allFrame = frames;
            showFirstFrame(container, frames[0]);
            setInterval(function () {
                if (!playerPaused) {
                    updatePlayer(container, playerIndex, allFrame);
                    playerIndex++;
                    if (playerIndex > allFrame.length - 1) {
                        playerPaused = true;
                        if (onEnd) {
                            onEnd();
                        }
                    }
                }
            }, 100);
        });
    });
}

function startMeasure() {
    return new Date();
}

function endMeasure(startTime) {
    var endTime = new Date();
    var timeDiff = endTime - startTime;
    return timeDiff;
}

function loadImages(callback) {
    var startTime = startMeasure();
    var loadTimer;
    var loadedImages = [];

    var imageBaseUrl = 'http://storage.googleapis.com/alyo/assignments/images/';


    for (var i = 0; i < 7; i++) {
        loadedImages.push(new Image());
        loadedImages[i].crossOrigin = "Anonymous"; // ?
        loadedImages[i].src = imageBaseUrl + i + '.jpg';
    }

    loadTimer = setInterval(function () {
        var allLoaded = true;
        for (var i = 0; i < 7; i++) {
            if (!loadedImages[i].complete) {
                allLoaded = false;
            } else {
                break;
            }
        }
        if (allLoaded) {
            clearInterval(loadTimer);
            callback(loadedImages, endMeasure(startTime));
        }
    }, 50);

}

function extractFramesFromImageArray(images, callback) {
    var allFrame = [];
    for (var i = 0; i < images.length; i++) {
        var image = images[i];
        var frameSize = [image.width / 5, image.height / 5]; // frames separated 5x5 in images

        for (var x = 0; x < 5; x++) {
            for (var y = 0; y < 5; y++) {
                var croppedFrameData = getImagePortion(image, frameSize[0], frameSize[1], (frameSize[0] * x),
                    (frameSize[1] * y));
                allFrame.push(croppedFrameData);
            }
        }

    }
    callback(allFrame);
}

function getImagePortion(imgObj, newWidth, newHeight, startX, startY) {
    //set up canvas for thumbnail
    var tnCanvas = document.createElement('canvas');
    var tnCanvasContext = tnCanvas.getContext('2d');
    tnCanvas.width = newWidth;
    tnCanvas.height = newHeight;

    // use the sourceCanvas to duplicate the entire image
    var bufferCanvas = document.createElement('canvas');
    var bufferContext = bufferCanvas.getContext('2d');
    bufferCanvas.width = imgObj.width;
    bufferCanvas.height = imgObj.height;
    bufferContext.drawImage(imgObj, 0, 0);

    // drawImage method take the pixels from bufferCanvas and draw them into thumbnail canvas
    tnCanvasContext.drawImage(bufferCanvas, startX, startY, newWidth, newHeight, 0, 0, newWidth, newHeight);
    return tnCanvas.toDataURL();
}

function setProgressBarPercantage(playerIndex, allFrame) {
    var percentage = (playerIndex / (allFrame.length - 1)) * 100;

    //console.log({playerIndex, allFrame: allFrame.length, percentage}); for test

    document.getElementById('progressBar').style.width = percentage + '%';
    document.getElementById('playerInfo').innerText = 'Current Frame Index / Total Frame: \t' + playerIndex + ' / ' +
        (allFrame.length - 1) + '\n Percentage \t' + Math.floor(percentage) + '%';
}

//set cover image

function showFirstFrame(container, frame) {
    container.style.backgroundImage = 'url(' + frame + ')';
}

//update percentage from index

function updatePlayer(container, playerIndex, allFrame) {
    container.style.backgroundImage = 'url(' + allFrame[playerIndex] + ')';
    setProgressBarPercantage(playerIndex, allFrame);
}
