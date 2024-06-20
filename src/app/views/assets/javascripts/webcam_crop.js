let cropper = "";
let dataToSend;
const canvas = document.getElementById('canvas');
let model;
const previewImage = document.getElementById("preview-image");
const webcam = new Webcam(document.getElementById('wc'));

let continueInterval = true;

async function init(){
  await webcam.setup("device-list");
  model = await tf.loadLayersModel('js/models/model.json');
  console.log(model.summary());

}

async function captureNow(){
  console.log("pressed");
  const dataURL = await webcam.captureWithoutTensorFlow();
  previewImage.src = dataURL;
  if(cropper){
    cropper.destroy();
  }
  cropper = new Cropper(previewImage);

}

async function startInterval() {
  let cropperData;
  let classes = {};
  await fetch('https://markir-cloudrun-service-qzscs7q7dq-et.a.run.app/parking_slot/get')
        .then(response => response.json())
        .then(data => {cropperData = data})
        .catch(error => console.error('Error:', error));
  

  async function runIteration() {
    console.log('halo');
    const ctx = canvas.getContext('2d');
    const dataURL = await webcam.captureWithoutTensorFlow();
    const img = new Image();
    img.src = dataURL;

    await new Promise((resolve) => {
      img.onload = resolve;
    });

    console.log(cropperData);

    for (let i in cropperData) {
      console.log("car "+i);

      let { left, top, width, height } = cropperData[i];
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, left, top, width, height, 0, 0, width, height);
      const croppedImageURL = canvas.toDataURL();
      const croppedImg = new Image();
      croppedImg.src = croppedImageURL;
      await new Promise((resolve) => {
        croppedImg.onload = resolve;
      });

      let classId = await predict(croppedImg);
      console.log(classId);
      classes[i] = classId;
    }
    console.log(classes);
    fetch('https://markir-cloudrun-service-qzscs7q7dq-et.a.run.app/parking_slot/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(classes),
    })
    .then(response => console.log(response.text()))
    .then(data => console.log(data))
    .catch(error => console.error('Error:', error));

    // Schedule the next iteration after 10000 milliseconds (10 seconds)
    if(continueInterval){
      setTimeout(runIteration, 5000);
    }
  }

  // Start the initial iteration
  continueInterval = true;
  runIteration();
}

function stopInterval(){
  continueInterval = false;
  console.log('Interval stopped');
}

function convertToTf(imgSrc){
  return tf.tidy(() => {
    const webcamImage = tf.browser.fromPixels(imgSrc);
    const reversedImage = webcamImage.reverse(1);
    const croppedImage = webcam.cropImage(reversedImage);
    const expandedImg = croppedImage.expandDims(0);
    const batchedImg =  expandedImg.toFloat().div(tf.scalar(127)).sub(tf.scalar(1));
    return tf.image.resizeBilinear(batchedImg,[150, 150]);
  });
}

function sendData(){
  
  if(cropper){
    let data = cropper.getCropBoxData();
    console.log(data);
    const column = document.getElementById("column_input").value;
    const row = document.getElementById("row_input").value;

    dataToSend = {
      "num" : data['num'],
      "left" : data['left'],
      "top" : data['top'],
      "width" : data['width'],
      "height" : data['height'],
      "row" : row,
      "column" : column
    };
  }

  if(dataToSend){
    let text = "Are you sure you want send the data.\n\
    Row: "+dataToSend['row']+" Column: "+dataToSend['column'];
    if (confirm(text) == true) {
      fetch('https://markir-cloudrun-service-qzscs7q7dq-et.a.run.app/parking_slot/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          left : dataToSend['left'],
          top : dataToSend['top'],
          width : dataToSend['width'],
          height : dataToSend['height'],
          row : dataToSend['row'],
          column : dataToSend['column']
        }),
      })
      .then(response => response.text())
      .then(data => console.log(data))
      .catch(error => console.error('Error:', error));
      dataToSend = null;
      cropReset();
    }
    console.log("Data to Send:");
    console.log(dataToSend);
  }
}

function cropReset(){
  if(cropper){
    cropper.reset();
    dataToSend = null;
  }
}

async function predict(img){
  let classId;
  let processedImg = convertToTf(img);
  let predictions = await model.predict(processedImg);
  classId = (await predictions.data())[0];
  console.log(classId);
  if(classId >= 1e-20){
    return 0;
  }else {
    return 1;
  }
}


init();
