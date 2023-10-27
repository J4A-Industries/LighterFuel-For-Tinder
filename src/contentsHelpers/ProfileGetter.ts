/* eslint-disable no-restricted-syntax */
/* eslint-disable no-underscore-dangle */
import { sendToBackgroundViaRelay } from '@plasmohq/messaging';
import type { Match, Person } from '~src/misc/tinderTypes';

const dateFromObjectId = (objectId) => new Date(parseInt(objectId.substring(0, 8), 16) * 1000);

const extractRecPhotoId = (url: string) => {
  const regex = /\/u\/([^/]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

// this gets the uuid of the photo from the url
const extractUuidFromUrl = (url) => {
  const regex = /_(.*?)\./;
  const match = url.match(regex);
  if (match && match[1]) {
    const uuid = match[1].replace(/^(\d+)_/, '');
    return uuid;
  }
  return null;
};

type rec = {
	user: Person;
};

class ProfileGetter {
  matches: Match[] = [];

  people: Person[] = [];

  matchData: any;

  constructor() {
    this.setCustomFetch();
  }

  /**
   * Sets a passthrough for the fetch so we can monitor requests
   * TODO: make this look nicer
   */
  setCustomFetch() {
    // save default fetch
    console.log('Setting custom fetch');

    const nativeFetch = window.fetch;
    window.fetch = (...args) => new Promise((resolve, reject) => {
      nativeFetch(...args).then((result) => {
        this.handleFetchResponse(result.clone(), args);
        resolve(result);
      }).catch((err) => reject(err));
    });
  }

  /**
   * TODO: move this to an external helper file
   * This method is to handle the response from the custom fetch when one appears
   * @param {Response} result The result from the fetch
   * @param {Array} args The arguments sent back
   */
  async handleFetchResponse(result: Response, args: any[]) {
    const regexChecks = {
      matches: /https:\/\/api.gotinder.com\/v2\/matches\?/g,
      core: /https:\/\/api.gotinder.com\/v2\/recs\/core\/*/g,
      profile: /https:\/\/api.gotinder.com\/v2\/profile\/*/g,
      user: /https:\/\/api.gotinder.com\/user\/([A-z0-9]+)/g,
      messages: /https:*:\/\/api.gotinder.com\/v2\/matches\/([A-z0-9]+)\/messages\?/g,
    };

    try {
      const jsonOut = await result.json();

      if (args[0].match(regexChecks.matches)) {
        this.handleNewMatches(jsonOut);
      } else if (args[0].match(regexChecks.core)) {
        this.handleNewCore(jsonOut);
        // TODO: handle core recs
      }
    } catch (e) {
      console.error(e);
      // if the response is not json, ignore it
    }
  }

  handleNewMatches(jsonOut: any) {
    if (!Array.isArray(jsonOut?.data?.matches)) console.error('Invalid matches response');

    const newMatches: Match[] = jsonOut.data.matches;

    newMatches.forEach((match) => {
      // getting the person from the match
      const { person } = match;

      // look for duplicates, if there are any, drop this person
      const existingPersonIndex = this.people.findIndex((p) => p._id === person._id);

      if (existingPersonIndex === -1) {
        person.type = 'match';
        this.people.push(person);
      }
    });
  }

  handleNewCore(jsonOut: any) {
    console.log('core recs', jsonOut);
    if (!Array.isArray(jsonOut?.data?.results)) console.error('Invalid core response');

    const newRecs: rec[] = jsonOut.data.results;

    newRecs.forEach((rec) => {
      const person = rec.user;

      // look for duplicates, if there are any, drop this person
      const existingPersonIndex = this.people.findIndex((p) => p._id === person._id);

      if (existingPersonIndex === -1) {
        person.type = 'rec';
        this.people.push(person);
        console.log('new person added from core!', person);
      }
    });
  }

  // infoFromPhoto(url: string) {
  //   // search through all of the matches for the photo with the same URL
  //   return this.people.find((person) => {
  //     let found: Person | undefined;
  //     if (person.type === 'match') {
  //       const photoId = extractUuidFromUrl(url);
  //       const photoRecord = person.photos.find((photo) => photo.id === photoId);

  //       if (photoRecord) {
  //         return {
  //           hqUrl: photoRecord.url,
  //           accountCreated: dateFromObjectId(person._id),
  //         };
  //       }
  //     } else if (person.type === 'rec') {
  //       const id = extractRecPhotoId(url);
  //       const photoRecord = person.photos.find((photo) => extractRecPhotoId(photo.url) === id);
  //       if (photoRecord) {
  //         return {
  //           hqUrl: photoRecord.url,
  //           accountCreated: dateFromObjectId(person._id),
  //         };
  //       }
  //     }
  //   });
  // }
  /**
	 * This
	 * @param url the photo URL attached to the account
	 */
  infoFromPhoto(url: string) {
    // search through all of the people
    for (const person of this.people) {
      let found: Person | undefined;
      if (person.type === 'match') {
        const photoId = extractUuidFromUrl(url);
        // search through person's photos
        for (const photo of person.photos) {
          if (photo.id === photoId) {
            // return photoRecord details immediately when you get a match
            return {
              hqUrl: photo.url,
              accountCreated: dateFromObjectId(person._id),
            };
          }
        }
      } else if (person.type === 'rec') {
        const id = extractRecPhotoId(url);
        // search through person's photos
        for (const photo of person.photos) {
          if (extractRecPhotoId(photo.url) === id) {
            // return photoRecord details immediately when you get a match
            return {
              hqUrl: photo.url,
              accountCreated: dateFromObjectId(person._id),
            };
          }
        }
      }
    }

    return undefined;
  }
}

export default ProfileGetter;
