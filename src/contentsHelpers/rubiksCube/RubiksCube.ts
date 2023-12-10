/* eslint-disable no-await-in-loop */
/* eslint-disable class-methods-use-this */
import {
  connectToBluetoothDevice,
  disconnectFromBluetoothDevice,
  startNotifications,
} from './bluetooth';
import {
  decrypt,
  getMove,
  getState,
} from './decode';

const changeImageViewed = (direction: 'next' | 'previous' | 'reset') => {
  const tabList = [...document.querySelectorAll('div.CenterAlign')].filter((div) => div.getAttribute('role') === 'tablist');
  if (!tabList.length) return;
  tabList.forEach((list) => {
    const selectedIndex = [...list.children].findIndex((div) => div.getAttribute('aria-selected') === 'true');
    let nextIndex;

    switch (direction) {
      case 'next':
        if (selectedIndex === -1 || selectedIndex + 1 >= list.children.length) return;
        nextIndex = selectedIndex + 1;
        break;
      case 'previous':
        if (selectedIndex === -1 || selectedIndex - 1 < 0) return;
        nextIndex = selectedIndex - 1;
        break;
      case 'reset':
        nextIndex = 0;
        break;
      default:
        nextIndex = selectedIndex;
    }

    const next = list.children[nextIndex] as HTMLButtonElement;
    if (!next) return;
    next.click();
  });
};

class RubiksCube {
  device: BluetoothDevice | undefined;

  server: BluetoothRemoteGATTServer | undefined;

  characteristic: BluetoothRemoteGATTCharacteristic | undefined;

  constructor() {
    this.addButtonToPage();
  }

  handleMove(move: string) {
    console.log(`Move: ${move}`);
    const buttons = [...document.querySelectorAll('button.button')] as HTMLButtonElement[];
    const tabList = [...document.querySelectorAll('div.CenterAlign')].filter((div) => div.getAttribute('role') === 'tablist');
    if (move === 'B') {
      // pass
      buttons[1].click();
      changeImageViewed('reset');
    } else if (move === 'B\'') {
      // like
      buttons[3].click();
      changeImageViewed('reset');
    } else if (move === 'F') { // next image
      changeImageViewed('next');
    } else if (move === 'F\'') { // previous image
      changeImageViewed('previous');
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

  addButtonToPage() {
    // check for the profile page (where the buttons are)
    // todo: maybe find a better way to do this
    setInterval(() => {
      const menu = document.querySelector('.menu__content');
      if (!menu) return;
      const button = document.getElementById('rubiksCubeButton');
      if (button) return;

      const newElement = document.createElement('div');
      newElement.className = 'Mt(20px)--ml Mt(16px)';
      newElement.innerHTML += `
      <div class="settings__container BdY Bdc($c-ds-divider-primary)" role="group">
        <div class="menuItem Bgc($c-ds-background-primary) focus-visible_Bgc($c-ds-foreground-blue) Trsdu($fast)" id="rubiksCubeButton">
            <div class="menuItem__contents Pos(r) Px(12px) Px(24px)--ml Py(0) M(0)--ml Mih(52px) settings__container_Px(16px) D(f) Jc(c) Fxd(c) W(100%) Cur(p) focus-background-style" role="button" tabindex="0">
              <div class="D(f) Jc(sb) Ai(c)">
                  <div class="Maw(80%) Ov(h) Tov(e) M(a) Cur(p)">Rubiks Cube Mode</div>
              </div>
            </div>
        </div>
      </div>`;
      menu.appendChild(newElement);
      const buttonElement = document.getElementById('rubiksCubeButton');
      if (!buttonElement) return;
      buttonElement.addEventListener('click', async () => {
        try {
          await this.handleActivation();
        } catch (err) {
          alert(`Error connecting to cube, try again. ${err}`);
        }
      });
    }, 500);
  }
}

export default RubiksCube;
