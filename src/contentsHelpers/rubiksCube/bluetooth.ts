/* eslint-disable no-undef */
// Largely based off of https://github.com/wachino/xiaomi-mi-smart-rubik-cube/blob/master/src/helpers/bluetooth.js

const SERVICE_UUID = '0000aadb-0000-1000-8000-00805f9b34fb';
const CHARACTERISTIC_UUID = '0000aadc-0000-1000-8000-00805f9b34fb';

const isWebBluetoothSupported = 'bluetooth' in navigator;

const connectToBluetoothDevice = () => navigator.bluetooth
  .requestDevice({
    acceptAllDevices: true,
    optionalServices: [SERVICE_UUID],
  })
  .then((device) => device?.gatt?.connect().then((server) => {
    (window as any).mdevice = device;
    (window as any).mserver = server;
    return { device, server };
  }));

const startNotifications = (server: BluetoothRemoteGATTServer) => server.getPrimaryService(SERVICE_UUID).then((service) => {
  (window as any).mservice = service;
  return service.getCharacteristic(CHARACTERISTIC_UUID).then((characteristic) => {
    (window as any).mcharacteristic = characteristic;
    characteristic.startNotifications();
    return characteristic;
  });
});

const disconnectFromBluetoothDevice = (device: BluetoothDevice) => {
  if (!device || !device?.gatt?.connected) return Promise.resolve();
  return device.gatt.disconnect();
};

export {
  isWebBluetoothSupported,
  connectToBluetoothDevice,
  startNotifications,
  disconnectFromBluetoothDevice,
};
