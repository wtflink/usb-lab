const usb = require('usb');

const VID = 0x2109;
const PID = 0x8883;
const usbDelay = 50;

const m27q = usb.findByIds(VID, PID);

m27q.open();

function delay(ms) {
  setTimeout(() => {}, ms);
}

function usbWrite(bRequest, wValue, wIndex, message) {
  const bmRequestType = 0x40;

  m27q.controlTransfer(
    bmRequestType,
    bRequest,
    wValue,
    wIndex,
    Buffer.from(message),
    (err, data) => {
      if (err) {
        console.log(err);
      }
    }
  );

  delay(usbDelay);
}

async function usbRead(bRequest, wValue, wIndex, msgLength) {
  const bmRequestType = 0xc0;

  const result = await new Promise((resolve, reject) => {
    m27q.controlTransfer(
      bmRequestType,
      bRequest,
      wValue,
      wIndex,
      msgLength,
      (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      }
    );
  });

  delay(usbDelay);

  return result;
}

function getOSD(data) {
  usbWrite(178, 0, 0, [0x6e, 0x51, 0x81 + data.length, 0x01, ...data]);

  const result = usbRead(162, 0, 111, 12);

  return result;
}

function setOSD(data) {
  usbWrite(178, 0, 0, [0x6e, 0x51, 0x81 + data.length, 0x03, ...data]);
}

async function getVolume() {
  const result = await getOSD([0x62]);

  return result[10];
}

async function getKVMStatus() {
  const result = await getOSD([224, 105]);

  return result[10];
}

function setKVMStatus(status) {
  setOSD([224, 105, status]);
}

async function toggleKVM() {
  const result = await getKVMStatus();

  return setKVMStatus(1 - result);
}

toggleKVM()
  .then(console.log('toggle KVM!'))
  .then(() => {
    delay(usbDelay);
    process.exit(0);
  });