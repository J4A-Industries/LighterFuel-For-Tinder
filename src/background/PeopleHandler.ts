/* eslint-disable no-restricted-syntax */
/* eslint-disable no-underscore-dangle */
import type { Person } from '~src/misc/tinderTypes';

type photoInfo = {
	hqUrl: string;
	accountCreated: Date;
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
  people: Person[];

  handleNewPeople(people: Person[]) {
    people.forEach((person) => {
      if (!this.people.find((p) => p._id === person._id)) {
        this.people.push(person);
      }
    });
  }

  /**
	 * This
	 * @param url the photo URL attached to the account
	 */
  getInfoFromPhoto(url: string): photoInfo {
    // search through all of the people
    for (const person of this.people) {
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
