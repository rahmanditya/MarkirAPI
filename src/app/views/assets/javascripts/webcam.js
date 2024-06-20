// Copyright 2019 The TensorFlow Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
// =============================================================================

/**
 * A class that wraps webcam video elements to capture Tensor4Ds.
 */


class Webcam {
  /**
   * @param {HTMLVideoElement} webcamElement A HTMLVideoElement representing the
   *     webcam feed.
   */
  constructor(webcamElement) {
    this.webcamElement = webcamElement;
    this.canvasElement = document.createElement('canvas');

  }

  /**
   * Captures a frame from the webcam and normalizes it between -1 and 1.
   * Returns a batched image (1-element batch) of shape [1, w, h, c].
   */


  capture() {
    return tf.tidy(() => {
      // Reads the image as a Tensor from the webcam <video> element.
      const webcamImage = tf.browser.fromPixels(this.webcamElement);

      const reversedImage = webcamImage.reverse(1);

      // Crop the image so we're using the center square of the rectangular
      // webcam.
      const croppedImage = this.cropImage(reversedImage);

      // Expand the outer most dimension so we have a batch size of 1.
      const batchedImage = croppedImage.expandDims(0);

      // Normalize the image between -1 and 1. The image comes in between 0-255,
      // so we divide by 127 and subtract 1.
      return batchedImage.toFloat().div(tf.scalar(127)).sub(tf.scalar(1));
    });
  }

  async captureWithoutTensorFlow() {
    // Set canvas width and height to match webcam's dimensions
    this.canvasElement.width = this.webcamElement.videoWidth;
    this.canvasElement.height = this.webcamElement.videoHeight;

    console.log(this.canvasElement.width+" "+this.canvasElement.height)

    this.canvasContext = this.canvasElement.getContext('2d');

    // Draw the video frame onto the canvas
    this.canvasContext.drawImage(this.webcamElement, 0, 0, this.canvasElement.width, this.canvasElement.height);

    // Retrieve the image data from the canvas
    const imageData = this.canvasContext.getImageData(0, 0, this.canvasElement.width, this.canvasElement.height);
    // Draw the cropped image onto a new canvas
    const outputCanvas = document.createElement('canvas');
    outputCanvas.width = this.canvasElement.width;
    outputCanvas.height = this.canvasElement.height;
    const outputContext = outputCanvas.getContext('2d');
    outputContext.putImageData(imageData, 0, 0);

    // Convert the canvas to a data URL
    return outputCanvas.toDataURL();
  }

  /**
   * Crops an image tensor so we get a square image with no white space.
   * @param {Tensor4D} img An input image Tensor to crop.
   */


  cropImage(img) {
    const size = Math.min(img.shape[0], img.shape[1]);
    const centerHeight = img.shape[0] / 2;
    const beginHeight = centerHeight - (size / 2);
    const centerWidth = img.shape[1] / 2;
    const beginWidth = centerWidth - (size / 2);
    return img.slice([beginHeight, beginWidth, 0], [size, size, 3]);
  }

  /**
   * Adjusts the video size so we can make a centered square crop without
   * including whitespace.
   * @param {number} width The real width of the video element.
   * @param {number} height The real height of the video element.
   */


  adjustVideoSize(width, height) {
    const aspectRatio = width / height;
    if (width >= height) {
      this.webcamElement.width = aspectRatio * this.webcamElement.height;
    } else if (width < height) {
      this.webcamElement.height = this.webcamElement.width / aspectRatio;
    }
  }

  async setup(deviceElementID) {
    return new Promise((resolve, reject) => {
      navigator.mediaDevices.enumerateDevices()
        .then(devices => {
          const videoDevices = devices.filter(device => device.kind === 'videoinput');

          // If there are multiple video devices, let the user choose one
          if (videoDevices.length > 1) {
            const deviceOptions = videoDevices.map((device, index) => ({
              label: `Camera ${index + 1}`,
              value: device.deviceId
            }));

            // Use a select element to allow the user to choose the
            const selectElement = document.getElementById(deviceElementID);

//             // Create a new element
//             const newElement = document.createElement('div');
//             newElement.textContent = 'New Element';
//
// //           Find the parent element
//             const parentElement = document.getElementById('parent');
//
// //          Append the new element to the parent
//             parentElement.appendChild(newElement);
            selectElement.addEventListener('change', event => {
              const selectedDeviceId = event.target.value;
              const selectedDevice = videoDevices.find(device => device.deviceId === selectedDeviceId);
              this.startCamera(selectedDevice, resolve, reject); // Pass resolve and reject to startCamera()
            });

            deviceOptions.forEach(option => {
              const optionElement = document.createElement('option');
              optionElement.textContent = option.label;
              optionElement.value = option.value;
              selectElement.appendChild(optionElement);
            });
          }

          // Start the camera with the default device
          const defaultDevice = videoDevices[0];
          this.startCamera(defaultDevice, resolve, reject); // Pass resolve and reject to startCamera()
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  startCamera(device, resolve, reject) { // Accept resolve and reject as parameters
    navigator.getUserMedia = navigator.getUserMedia ||
      navigator.webkitGetUserMedia || navigator.mozGetUserMedia ||
      navigator.msGetUserMedia;
    if (navigator.getUserMedia) {
      navigator.getUserMedia(
        { video: { deviceId: device.deviceId } },
        stream => {
          this.webcamElement.srcObject = stream;
          this.webcamElement.addEventListener('loadeddata', async () => {
            this.adjustVideoSize(
              this.webcamElement.videoWidth,
              this.webcamElement.videoHeight);
            resolve(); // Resolve the promise
          }, false);
        },
        error => {
          reject(error); // Reject the promise
        });
    } else {
      reject(); // Reject the promise
    }
  }

}
