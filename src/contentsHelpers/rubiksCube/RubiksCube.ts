/* eslint-disable no-await-in-loop */
/* eslint-disable class-methods-use-this */
import { sendToBackground } from '@plasmohq/messaging';
import type { activateRubiksCubeRequest, activateRubiksCubeResponse } from '~src/background/messages/activateRubiksCube';
import { connectToBluetoothDevice, disconnectFromBluetoothDevice, startNotifications } from './bluetooth';
import { decrypt, getMove, getState } from './decode';

class RubiksCube {
  device: BluetoothDevice | undefined;

  server: BluetoothRemoteGATTServer | undefined;

  characteristic: BluetoothRemoteGATTCharacteristic | undefined;

  constructor() {
    this.pollForActivation();
  }

  handleMove(move: string) {
    console.log(`Move: ${move}`);
    const buttons = [...document.querySelectorAll('button.button')] as HTMLButtonElement[];
    if (move === 'B') {
      // pass
      buttons[1].click();
    } else if (move === 'B\'') {
      // like
      buttons[3].click();
    }
  }

  async handleActivation() {
    const connectResponse = await connectToBluetoothDevice();
    if (!connectResponse) {
      console.log('No cube connected');
      return;
    }
    const { server, device } = connectResponse;

    this.device = device;
    this.server = server;
    this.characteristic = await startNotifications(server);

    this.characteristic.addEventListener('characteristicvaluechanged', (event: any) => {
      if (!event.target?.value) return;
      const { value } = event.target; // 20 bytes sent by the cube
      const uint8array = decrypt(new Uint8Array(value.buffer));
      const state = getState(uint8array);
      console.log(state);
      this.handleMove(getMove(uint8array));
    });
    this.characteristic.addEventListener('gattserverdisconnected', () => {
      disconnectFromBluetoothDevice(this.device);
    });
  }

  async pollForActivation() {
    while (!this.device) {
      console.log('Polling for activation');
      const res = await sendToBackground<activateRubiksCubeRequest, activateRubiksCubeResponse>({
        name: 'activateRubiksCube',
      });
      console.log('got response!', res);
      if (res.active) {
        console.log('Activating cube!');
        await this.handleActivation();
      }
    }
  }
}

export default RubiksCube;
