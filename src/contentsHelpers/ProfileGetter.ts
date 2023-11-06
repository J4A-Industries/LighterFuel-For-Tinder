/* eslint-disable class-methods-use-this */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-underscore-dangle */
import { sendToBackgroundViaRelay } from '@plasmohq/messaging';
import type { Match, Person } from '~src/misc/tinderTypes';

type rec = {
	user: Person;
};

class ProfileGetter {
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

    const people = [];

    newMatches.forEach((match) => {
      // getting the person from the match
      const { person } = match;
      person.type = 'match';
      people.push(person);
    });

    this.sendPeopleToBackground(people);
  }

  handleNewCore(jsonOut: any) {
    console.log('core recs', jsonOut);
    if (!Array.isArray(jsonOut?.data?.results)) console.error('Invalid core response');

    const newRecs: rec[] = jsonOut.data.results;
    const people = [];

    newRecs.forEach((rec) => {
      const person = rec.user;

      person.type = 'rec';
      people.push(person);
      console.log('new person added from core!', person);
    });

    this.sendPeopleToBackground(people);
  }

  sendPeopleToBackground(people: Person[]) {
    sendToBackgroundViaRelay({
      name: 'getPeople',
      body: {
        people,
      },
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
}

export default ProfileGetter;