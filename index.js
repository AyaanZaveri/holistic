// Move the mouse across the screen as a sine wave.
var robot = require("robotjs");
var axios = require("axios");

// Speed up the mouse.
robot.setMouseDelay(2);

const getData = () => {
  axios
    .get("https://notch-spicy-melody.glitch.me/pose")
    .then((response) => {
      var last = response.data[response.data.length - 1];
      console.log(last);
      // robot.moveMouse(last.x * 1920, last.y * 1080);
      // console.log(last);
    })
    .catch((error) => {
      console.log(error);
    });
};

setInterval(getData, 3000);
