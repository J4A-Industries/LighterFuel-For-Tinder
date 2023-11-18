/* eslint-disable class-methods-use-this */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-underscore-dangle */
import { debug } from '~src/misc/config';
import type { Person } from '~src/misc/tinderTypes';

export type photoInfo = {
	hqUrl: string;
	accountCreated: number;
	original: string;
  type: 'match' | 'rec' | 'profile';
} | undefined;

const dateFromObjectId = (objectId) => new Date(parseInt(objectId.substring(0, 8), 16) * 1000);

const extractRecPhotoId = (url: string) => {
  const regex = /\/u\/([^/]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

const checkForRec = (input: string) => {
  const regex = /https:\/\/images-ssl\.gotinder\.com\/u\/[A-Za-z0-9]+\/([A-Za-z0-9]+(\.[A-Za-z0-9]+)+)/i;
  return regex.test(input);
};

const extractUuidFromUrl = (inUrl: string) => {
  const url = new URL(inUrl);
  const path = url.pathname.split('/');
  const fileName = path[path.length - 1];
  const regex = /([a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12})/;
  const match = fileName.match(regex);

  if (!match || match.length === 0) {
    return null;
  }
  return match[0];
};

export class PeopleHandler {
  people: (Person & {addedAt: number})[] = [];

  handleNewPeople(people: Person[]) {
    people.forEach((person) => {
      if (!this.people.find((p) => p._id === person._id)) {
        this.people.push(
          {
            ...person,
            addedAt: Date.now(),
          },
        );
      }
    });

    // if there are over 100 people in the array who are recs, remove the oldest ones

    if (this.people.length > 100) {
      const recs = this.people.filter((person) => person.type === 'rec')
        .sort((a, b) => a.addedAt - b.addedAt);

      while (recs.length > 100) {
        const oldestPerson = recs.shift();
        this.people = this.people.filter((person) => person._id !== oldestPerson._id);
      }
    }

    if (debug) console.log('people', this.people);
  }

  /**
	 * This
	 * @param url the photo URL attached to the account
	 */
  getInfoFromPhoto(url: string): photoInfo {
    // search through all of the people

    // ! This is a hacky way to check if the url is a person rec or not
    const personRec = checkForRec(url);

    if (personRec) {
      for (const person of this.people) {
        const id = extractRecPhotoId(url);
        // search through person's photos
        for (const photo of person.photos) {
          if (extractRecPhotoId(photo.url) === id) {
            if (!photo.url) console.error('no photo url, recs', photo);

            // return photoRecord details immediately when you get a match
            return {
              original: url,
              hqUrl: photo.url,
              accountCreated: dateFromObjectId(person._id).getTime(),
              type: person.type,
            };
          }
        }
      }
    } else {
      for (const person of this.people) {
        const photoId = extractUuidFromUrl(url);
        // search through person's photos
        for (const photo of person.photos) {
          if (extractUuidFromUrl(photo.url) === photoId) {
            // return photoRecord details immediately when you get a match
            return {
              original: url,
              hqUrl: photo.url,
              accountCreated: dateFromObjectId(person._id).getTime(),
              type: person.type,
            };
          }
        }
      }
    }

    console.error('no match found for url', url);
    return undefined;
  }
}
