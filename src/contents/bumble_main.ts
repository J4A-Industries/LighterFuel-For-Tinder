/* eslint-disable no-underscore-dangle */
import { sendToBackgroundViaRelay } from '@plasmohq/messaging';
import type { PlasmoCSConfig } from 'plasmo';
import type {
  BumbleProfile, GetEncounters, GetUserList, GetUserQuery, MergedUser,
} from '~src/misc/bumbleTypes';
import { debug } from '~src/misc/config';

/**
 * Execute the script on the tinder website,
 * Running in 'main' world, which means it has access to the DOM
 */
export const config: PlasmoCSConfig = {
  matches: ['*://*.bumble.com/*'],
  run_at: 'document_start',
  world: 'MAIN',
};

const handleImageUpload = async (data: string) => {
  try {
    // the data is a stringified JSON object, the BumbleProfile interface is autogenerated from the JSON
    const response: BumbleProfile = JSON.parse(data);
    // find the first body that has a client_upload_photo property
    const fileUpload = response.body.find((b) => b.client_upload_photo);

    if (!fileUpload) {
      console.log('No file upload found');
      return;
    }

    const photo = fileUpload?.client_upload_photo.photo;

    if (!photo) {
      console.log('No photo found');
      return;
    }

    let photoUrl = photo.large_url;

    if (!photoUrl.startsWith('https://')) {
      photoUrl = `https:${photoUrl}`;
    }

    const url = new URL(photoUrl);

    const { host } = url;

    // here is the actual ID of the photo
    const id = parseInt(photo.id, 10);
    // let's pseudo-anonymize it as we don't need a precise ID
    const pseudoAnonId = id - 10 + Math.floor((Math.random() * 20) + 1);

    if (debug) console.log(`Pseudo-anonymised ID: ${pseudoAnonId}, Original ID: ${id}`);

    await sendToBackgroundViaRelay({
      name: 'bumbleID',
      body: {
        id: pseudoAnonId,
        host,
      },
    });
  } catch (err) {
    console.error(err);
  }
};

const handleUserList = async (data: string) => {
  try {
    // the data is a stringified JSON object, the BumbleProfile interface is autogenerated from the JSON
    const response: GetUserList = JSON.parse(data);

    const bodys = response.body.filter((b) => b.client_user_list);

    if (bodys.length === 0) {
      if (debug) console.log('No user list found');
    }

    const users = bodys.reduce((acc, body) => {
      const extractedUsers = body.client_user_list.section.reduce((acc2, section) => {
        if (section.users) {
          acc2.push(...section.users);
        }
        return acc2;
      }, []);

      acc.push(...extractedUsers);
      return acc;
    }, []);

    if (debug) console.log(`Found ${users.length} users`);
    console.log(users);
  } catch (err) {
    console.error(err);
  }
};

const handleEncounters = async (data: string) => {
  try {
    const response: GetEncounters = JSON.parse(data);

    const encounters = response.body.filter((b) => b.client_encounters);

    if (encounters.length === 0) {
      if (debug) console.log('No encounters found');
      return;
    }

    const users = encounters.reduce((acc, body) => {
      const extractedUsers = body.client_encounters.results.reduce((acc2, result) => {
        acc2.push(result.user);
        return acc2;
      }, []);
      acc.push(...extractedUsers);
      return acc;
    }, []);

    if (debug) console.log(`Found ${users.length} encounters`);
    console.log(users);

    await sendToBackgroundViaRelay({
      name: 'bumbleUser',
      body: {
        users,
      },
    });
  } catch (err) {
    console.error(err);
  }
};

const handleUser = async (data: string) => {
  try {
    const response: GetUserQuery = JSON.parse(data);

    const users = response.body.filter((b) => b.user).map((b) => b.user);

    if (users.length === 0) {
      if (debug) console.log('No user found');
      return;
    }

    if (debug) console.log(`Found ${users.length} users`);
    console.log(users);

    const merged: MergedUser[] = users;

    await sendToBackgroundViaRelay({
      name: 'bumbleUser',
      body: {
        users: merged,
      },
    });
  } catch (err) {
    console.error(err);
  }
};

const replaceWindowXMLHttpRequest = () => {
  class Interceptor extends XMLHttpRequest {
    url: string = '';

    open(method: string, url: string | URL) {
      this.url = typeof url === 'string' ? url : url.toString();
      super.open(method, url);
    }

    send(d) {
      // When the state changes
      this.addEventListener('readystatechange', () => {
        // if there's been a photo upload...
        if (this.readyState === 4 && this.url.includes('SERVER_UPLOAD_PHOTO')) {
          handleImageUpload(this.responseText);
        } /* else if (this.readyState === 4 && this.url.includes('SERVER_GET_USER_LIST')) {
          // here's a list of some of the people the user has matched with * Not sure if this is needed *
          handleUserList(this.responseText);
        } else if (this.readyState === 4 && this.url.includes('SERVER_GET_ENCOUNTERS')) {
          // here's a list of some of the users the user is to swipe on
          handleEncounters(this.responseText);
        } else if (this.readyState === 4 && this.url.includes('SERVER_GET_USER')) {
          // here's a single profile that the user has clicked on (eg a match)
          handleUser(this.responseText);
        } */
      });
      super.send(d);
    }
  }

  // Replace default XMLHttpRequest with custom class
  window.XMLHttpRequest = Interceptor;
};

replaceWindowXMLHttpRequest();