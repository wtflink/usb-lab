
const HID = require('node-hid');

const VENDOR_ID_NINTENDO = 0x057e;
const DEVICE_ID_NINTENDO_PROCON = 0x2009;
const DEVICE_ID_NINTENDO_JOYCON_L =	0x2006;
const DEVICE_ID_NINTENDO_JOYCON_R =	0x2007;

const PROCON_REPORT_SEND_USB = 0x80;
const PROCON_REPORT_REPLY_USB = 0x81;
const PROCON_REPORT_REPLY = 0x21;
const PROCON_REPORT_TYPE = 0x00;
const PROCON_REPORT_CMD_ACK = 0x0e;
const PROCON_REPORT_INPUT_FULL = 0x30;
const PROCON_REPORT_INPUT_SIMPLE = 0x3f;

const PROCON_USB_HANDSHAKE = 0x02;
const PROCON_USB_BAUD = 0x03;
const PROCON_USB_ENABLE = 0x04;
const PROCON_USB_DISABLE = 0x05;
const PROCON_USB_DO_CMD = 0x92;

const PROCON_CMD_AND_RUMBLE = 0x01;
const PROCON_CMD_RUMBLE_ONLY = 0x10;

const PROCON_CMD_INFO = 0x02;
const PROCON_CMD_MODE = 0x03;
const PROCON_CMD_BTNTIME = 0x04;
const PROCON_CMD_LED = 0x30;
const PROCON_CMD_LED_HOME = 0x38;
const PROCON_CMD_GYRO = 0x40;
const PROCON_CMD_BATTERY = 0x50;

const PROCON_ARG_INPUT_FULL = 0x30;
const PROCON_ARG_INPUT_SIMPLE = 0x3f;

const PROCON_EVENT_TOGGLE_GYRO = 0xff;

const RUMBLE_NEUTRAL = [0x00, 0x01, 0x40, 0x40];
const RUMBLE = [0x74, 0xbe, 0xbd, 0x6f];

device = new HID.HID(VENDOR_ID_NINTENDO, DEVICE_ID_NINTENDO_PROCON);

device.on('data', function (data) {
  if (data[0] === PROCON_REPORT_REPLY_USB) {
    console.log('\n', data.toString('hex'));
  }
});

device.on('error', function (err) {
  console.log('\nerror: ', err.toString('hex'));
});

function sendCommand(command) {
  const data = [PROCON_REPORT_SEND_USB, ...command];

  console.log(device.write(data));
}

const padding = 0x00;
function sendSubCommand(command, param) {
  const data = [
    PROCON_CMD_AND_RUMBLE,
    padding,
    ...RUMBLE_NEUTRAL,
    ...RUMBLE_NEUTRAL,
    command,
    ...param,
  ];

  console.log(device.write(data));
}

function setPlayerLights(bit) {
  // LED controls work bitwise so
  // 1 = *---
  // 2 = -*--
  // and so on
  sendSubCommand(PROCON_CMD_LED, [bit]);
}

function setHomeLight(params) {
  sendSubCommand(PROCON_CMD_LED_HOME, params);
}

function sendRumble(low, high) {
  const data = [
    PROCON_CMD_RUMBLE_ONLY,
    padding,
    ...(low ? RUMBLE : RUMBLE_NEUTRAL),
    ...(high ? RUMBLE : RUMBLE_NEUTRAL),
  ];

  console.log(device.write(data));
}

// sendCommand([0x01]);
sendCommand([PROCON_USB_ENABLE]);
sendCommand([PROCON_USB_HANDSHAKE]);

setPlayerLights(5);

setTimeout(() => {
  setHomeLight([0x0f, 0xf0, 0x00]);

  setTimeout(() => {
    sendRumble(true, true);
  }, 3000);
}, 3000);
