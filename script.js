var video = document.querySelector("#videoElement");

navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia || navigator.oGetUserMedia;

var videoDevices = [];


function stopStream(stream) {
  stream.getVideoTracks().forEach(function (track) {
    track.stop();
  });
}


var cnt_camera = -1;
var s = undefined;
function initcam(toggle = true) {
  if (toggle) {
    cnt_camera += 1;
    cnt_camera = cnt_camera % videoDevices.length;
  }
  var constraints = { deviceId: { exact: videoDevices[cnt_camera] } }
  navigator.mediaDevices.getUserMedia({ video: constraints }).then(stream => {
    video.src = window.URL.createObjectURL(stream);
    s = stream
  }).catch(e => alert(e));
}


function swap_camera() {
  stopStream(s);
  initcam();
}

cnt_colorblindness_filters = -1;
colorblindness_filters = [
  {
    name: "Normal",
    comment: "",
    id: ""
  },
  {
    name: "Grayscale",
    comment: "",
    id: "grayscale"
  },
  {
    name: "Protanomaly",
    comment: "Reduced sensitivity to red light",
    id: "protanomaly"
  },
  {
    name: "Deuteranomaly",
    comment: "reduced sensitivity to green light<br />(most common form of color blindness)",
    id: "deuteranomaly"
  },
  {
    name: "Tritanomaly",
    comment: "reduced sensitivity to blue light<br />(fairly rare)",
    id: "tritanomaly"
  },
  {
    name: "Deuteranopia",
    comment: "",
    id: "deuteranopia"
  },
  {
    name: "tritanopia",
    comment: "",
    id: "tritanopia"
  }



]
function swap_colorblindness() {
  cnt_colorblindness_filters += 1;
  cnt_colorblindness_filters = cnt_colorblindness_filters % colorblindness_filters.length;
  var filter = colorblindness_filters[cnt_colorblindness_filters];
  var filter_css = filter['id'];
  if (filter_css != "") {
    filter_css = "url('filters.svg#" + filter_css + "')"
  }
  video.style.webkitFilter = filter_css;
  video.style.filter = filter_css;

  var title = document.querySelector("#title");
  title.innerHTML = filter['name']

  var comment = document.querySelector("#comment");
  comment.innerHTML = filter['comment']
}

navigator.mediaDevices.enumerateDevices()
  .then(devices => {

    var videoDeviceIndex = 0;
    devices.forEach(function (device) {
      if (device.kind == "videoinput") {
        videoDevices[videoDeviceIndex++] = device.deviceId;
      }
    });
    initcam();
    swap_colorblindness();
  })

  .catch(e => console.error(e));


window.addEventListener('load', function () {

  var touchsurface = video,
    startX,
    startY,
    dist,
    allowedTime = 200, // maximum time allowed to travel that distance
    elapsedTime,
    startTime;
  const threshold_x = window.screen.availWidth / 3;
  const threshold_y = window.screen.availHeight / 3;

  function handleswipe(isleftswipe, isrightswipe) {
    if (isrightswipe || isleftswipe) {
      swap_colorblindness();
    }
    else {
      swap_camera();
    }
  }

  touchsurface.addEventListener('touchstart', function (e) {
    var touchobj = e.changedTouches[0]
    dist = 0
    startX = touchobj.pageX
    startY = touchobj.pageY
    startTime = new Date().getTime() // record time when finger first makes contact with surface
    e.preventDefault()
  }, false)

  touchsurface.addEventListener('touchmove', function (e) {
    e.preventDefault() // prevent scrolling when inside DIV
  }, false)

  touchsurface.addEventListener('touchend', function (e) {
    var touchobj = e.changedTouches[0]
    dist = touchobj.pageX - startX // get total dist traveled by finger while in contact with surface
    elapsedTime = new Date().getTime() - startTime // get time elapsed
    // check that elapsed time is within specified, horizontal dist traveled >= threshold, and vertical dist traveled <= 100
    var swiperightBol = (
      elapsedTime <= allowedTime &&
      dist >= threshold_x &&
      Math.abs(touchobj.pageY - startY) <= threshold_y
    )
    var swipeleftBol = (
      elapsedTime <= allowedTime &&
      dist <= -threshold_x &&
      Math.abs(touchobj.pageY - startY) <= threshold_y
    )
    handleswipe(swipeleftBol, swiperightBol)
    e.preventDefault()
  }, false)

}, false) // end window.onload

document.addEventListener("visibilitychange", function (visible) {
  if (document.hidden) stopStream(s);
  else initcam(false);
});