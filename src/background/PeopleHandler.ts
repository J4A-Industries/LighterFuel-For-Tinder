/* eslint-disable class-methods-use-this */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-underscore-dangle */
import { debug } from '~src/misc/config';
import type { Person } from '~src/misc/tinderTypes';

export type photoInfo = {
	hqUrl: string;
	accountCreated: number;
	original: string;
} | undefined;

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
    for (const person of this.people) {
      if (person.type === 'match' || person.type === 'profile') {
        const photoId = extractUuidFromUrl(url);
        // search through person's photos
        for (const photo of person.photos) {
          if (photo.id === photoId) {
            // return photoRecord details immediately when you get a match
            return {
              original: url,
              hqUrl: photo.url,
              accountCreated: dateFromObjectId(person._id).getTime(),
            };
          }
        }
      } else if (person.type === 'rec') {
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
            };
          }
        }
      }
    }
    console.error('no match found for url', url);
    return undefined;
  }
}
