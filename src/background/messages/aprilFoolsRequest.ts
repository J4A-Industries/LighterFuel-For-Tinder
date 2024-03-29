import type { PlasmoMessaging } from '@plasmohq/messaging';
import { Storage } from '@plasmohq/storage';

export type AprilFoolsReqRequest = {};

export type AprilFoolsReqResponse = {
  alreadyPassed: boolean;
  overwriteObject: any;
};

export const overWriteData = {
  routing: {
    pathname: '/@acorn221',
    search: null,
    hash: null,
  },
  webProfile: {
    username: 'acorn221',
    user: {
      birth_date: '2002-03-22T22:23:24.521Z',
      _id: '65eb91cc96c0e601009e84ce',
      badges: [
        {
          type: 'selfie_verified',
        },
      ],
      jobs: [
        {
          company: {
            displayed: true,
            name: 'J4A Industries',
          },
          title: {
            displayed: true,
            name: 'Software Developer',
          },
        },
      ],
      name: 'James',
      photos: [
        {
          assets: [],
          id: 'b7df15f5-506e-4621-b84f-8f35e3e3893e',
          processedFiles: [
            {
              url: 'https://images-ssl.gotinder.com/65eb91cc96c0e601009e84ce/640x800_b7df15f5-506e-4621-b84f-8f35e3e3893e.jpg',
              height: 800,
              width: 640,
            },
            {
              url: 'https://images-ssl.gotinder.com/65eb91cc96c0e601009e84ce/320x400_b7df15f5-506e-4621-b84f-8f35e3e3893e.jpg',
              height: 400,
              width: 320,
            },
            {
              url: 'https://images-ssl.gotinder.com/65eb91cc96c0e601009e84ce/172x216_b7df15f5-506e-4621-b84f-8f35e3e3893e.jpg',
              height: 216,
              width: 172,
            },
            {
              url: 'https://images-ssl.gotinder.com/65eb91cc96c0e601009e84ce/84x106_b7df15f5-506e-4621-b84f-8f35e3e3893e.jpg',
              height: 106,
              width: 84,
            },
          ],
          type: 'image',
          url: 'https://images-ssl.gotinder.com/65eb91cc96c0e601009e84ce/original_b7df15f5-506e-4621-b84f-8f35e3e3893e.jpeg',
        },
        {
          assets: [],
          id: 'fb8a5567-b61e-489e-99d4-d31cfb7a529f',
          processedFiles: [
            {
              url: 'https://images-ssl.gotinder.com/65eb91cc96c0e601009e84ce/640x800_fb8a5567-b61e-489e-99d4-d31cfb7a529f.jpg',
              height: 800,
              width: 640,
            },
            {
              url: 'https://images-ssl.gotinder.com/65eb91cc96c0e601009e84ce/320x400_fb8a5567-b61e-489e-99d4-d31cfb7a529f.jpg',
              height: 400,
              width: 320,
            },
            {
              url: 'https://images-ssl.gotinder.com/65eb91cc96c0e601009e84ce/172x216_fb8a5567-b61e-489e-99d4-d31cfb7a529f.jpg',
              height: 216,
              width: 172,
            },
            {
              url: 'https://images-ssl.gotinder.com/65eb91cc96c0e601009e84ce/84x106_fb8a5567-b61e-489e-99d4-d31cfb7a529f.jpg',
              height: 106,
              width: 84,
            },
          ],
          type: 'image',
          url: 'https://images-ssl.gotinder.com/65eb91cc96c0e601009e84ce/original_fb8a5567-b61e-489e-99d4-d31cfb7a529f.jpeg',
        },
        {
          assets: [],
          id: '0e840a98-1f43-4561-8a74-108fe7c16b96',
          processedFiles: [
            {
              url: 'https://images-ssl.gotinder.com/65eb91cc96c0e601009e84ce/640x800_0e840a98-1f43-4561-8a74-108fe7c16b96.jpg',
              height: 800,
              width: 640,
            },
            {
              url: 'https://images-ssl.gotinder.com/65eb91cc96c0e601009e84ce/320x400_0e840a98-1f43-4561-8a74-108fe7c16b96.jpg',
              height: 400,
              width: 320,
            },
            {
              url: 'https://images-ssl.gotinder.com/65eb91cc96c0e601009e84ce/172x216_0e840a98-1f43-4561-8a74-108fe7c16b96.jpg',
              height: 216,
              width: 172,
            },
            {
              url: 'https://images-ssl.gotinder.com/65eb91cc96c0e601009e84ce/84x106_0e840a98-1f43-4561-8a74-108fe7c16b96.jpg',
              height: 106,
              width: 84,
            },
          ],
          type: 'image',
          url: 'https://images-ssl.gotinder.com/65eb91cc96c0e601009e84ce/original_0e840a98-1f43-4561-8a74-108fe7c16b96.jpeg',
        },
        {
          assets: [],
          id: '166b2853-6237-41aa-bece-7f0c1c3164d8',
          processedFiles: [
            {
              url: 'https://images-ssl.gotinder.com/65eb91cc96c0e601009e84ce/640x800_166b2853-6237-41aa-bece-7f0c1c3164d8.jpg',
              height: 800,
              width: 640,
            },
            {
              url: 'https://images-ssl.gotinder.com/65eb91cc96c0e601009e84ce/320x400_166b2853-6237-41aa-bece-7f0c1c3164d8.jpg',
              height: 400,
              width: 320,
            },
            {
              url: 'https://images-ssl.gotinder.com/65eb91cc96c0e601009e84ce/172x216_166b2853-6237-41aa-bece-7f0c1c3164d8.jpg',
              height: 216,
              width: 172,
            },
            {
              url: 'https://images-ssl.gotinder.com/65eb91cc96c0e601009e84ce/84x106_166b2853-6237-41aa-bece-7f0c1c3164d8.jpg',
              height: 106,
              width: 84,
            },
          ],
          type: 'image',
          url: 'https://images-ssl.gotinder.com/65eb91cc96c0e601009e84ce/original_166b2853-6237-41aa-bece-7f0c1c3164d8.jpeg',
        },
        {
          assets: [],
          id: 'c3ff2819-a924-424e-90e7-ecc8632b04d8',
          processedFiles: [
            {
              url: 'https://images-ssl.gotinder.com/65eb91cc96c0e601009e84ce/640x800_c3ff2819-a924-424e-90e7-ecc8632b04d8.jpg',
              height: 800,
              width: 640,
            },
            {
              url: 'https://images-ssl.gotinder.com/65eb91cc96c0e601009e84ce/320x400_c3ff2819-a924-424e-90e7-ecc8632b04d8.jpg',
              height: 400,
              width: 320,
            },
            {
              url: 'https://images-ssl.gotinder.com/65eb91cc96c0e601009e84ce/172x216_c3ff2819-a924-424e-90e7-ecc8632b04d8.jpg',
              height: 216,
              width: 172,
            },
            {
              url: 'https://images-ssl.gotinder.com/65eb91cc96c0e601009e84ce/84x106_c3ff2819-a924-424e-90e7-ecc8632b04d8.jpg',
              height: 106,
              width: 84,
            },
          ],
          type: 'image',
          url: 'https://images-ssl.gotinder.com/65eb91cc96c0e601009e84ce/original_c3ff2819-a924-424e-90e7-ecc8632b04d8.jpeg',
        },
      ],
    },
    deeplink: 'https://go.tinder.com/T5GpbmX6EFw-James',
  },
};

const handler: PlasmoMessaging.MessageHandler<AprilFoolsReqRequest, AprilFoolsReqResponse> = async (req, res) => {
  const storage = new Storage({
    area: 'sync',
  });

  const aprilFools2024Displayed = await storage.getItem<boolean>('aprilFools2024Displayed');

  res.send({
    alreadyPassed: aprilFools2024Displayed,
    overwriteObject: overWriteData,
  });
};

export default handler;
