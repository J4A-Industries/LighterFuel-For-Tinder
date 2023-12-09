/* eslint-disable no-param-reassign */
const decryptionKey = new Uint8Array([176, 81, 104, 224, 86, 137, 237, 119, 38, 26, 193, 161, 210, 126, 150, 81, 93, 13, 236, 249, 89, 235, 88, 24, 113, 81, 214, 131, 130, 199, 2, 169, 39, 165, 171, 41]);

const solvedState = new Uint8Array([0x12, 0x34, 0x56, 0x78, 0x33, 0x33, 0x33, 0x33, 0x12, 0x34, 0x56, 0x78, 0x9a, 0xbc, 0x00, 0x00]);

const isEncrypted = (data: Uint8Array) => data[18].toString(16) === 'a7';

/* const toBin = (dec) => {
  return (dec >>> 0).toString(2);
}; */

const getNibble = (val: Uint8Array, i: number) => {
  if (i % 2 === 1) {
    return val[(i / 2) | 0] % 16;
  }
  return 0 | (val[(i / 2) | 0] / 16);
};

const decrypt = (data: Uint8Array) => {
  if (!isEncrypted(data)) return data;
  const offset1 = getNibble(data, 38);
  const offset2 = getNibble(data, 39);
  for (let i = 0; i < 20; i++) {
    // Apply the offset to each value in the data
    data[i] += (decryptionKey[offset1 + i] + decryptionKey[offset2 + i]);
  }
  return data;
};

const getMove = (data: Uint8Array) => {
  const lastMoveFace = getNibble(data, 32);
  const lastMoveDirection = getNibble(data, 33);
  // for white side facing user, with red on top
  const faceNames = ['L', 'B', 'D', 'F', 'U', 'R'];

  return `${faceNames[lastMoveFace - 1]}${lastMoveDirection === 1 ? '' : '\''}`;
};

const getState = (data: Uint8Array) => {
  let state = '';
  for (let i = 0; i < 16; i++) {
    state += data[i].toString(16);
  }
  return state;
};

const getSolved = (data: Uint8Array) => data.reduce((acc, val, i) => acc && val === solvedState[i], true);

export {
  decrypt,
  getMove,
  getState,
  getSolved,
};
