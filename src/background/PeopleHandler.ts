/* eslint-disable no-continue */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-underscore-dangle */
import { Storage } from '@plasmohq/storage';
import { debug } from '~src/misc/config';
import type { Person, ProfileResponseData, UserStats } from '~src/misc/tinderTypes';

const maxPeopleToStore = 1000;

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

const extractUuidFromUrl = (inUrl: string): string | undefined => {
  try {
    const url = new URL(inUrl);
    const path = url.pathname.split('/');
    const fileName = path[path.length - 1];
    const regex = /([a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12})/;
    const match = fileName.match(regex);

    if (!match || match.length === 0) {
      return undefined;
    }
    return match[0];
  } catch (e) {
    console.error('error extracting uuid from url', inUrl, e);
  }
  return undefined;
};

const calculateAge = (birthday) => { // birthday is a date
  const ageDifMs = Date.now() - birthday;
  const ageDate = new Date(ageDifMs); // miliseconds from epoch
  return Math.abs(ageDate.getUTCFullYear() - 1970);
};

type PersonWithAddedAt = Person & {addedAt: number};

export class PeopleHandler {
  people: PersonWithAddedAt[] = [];

  storage: Storage;

  lastSavedTime = Date.now();

  constructor() {
    // get people from storage
    this.storage = new Storage({
      area: 'local',
    });

    this.storage.get<{people: PersonWithAddedAt[]}>('people').then((data) => {
      if (!data) return;
      if (data.people) {
        this.people = [...this.people, ...data.people];
      }
    });
  }

  handleNewPeople(people: Person[]) {
    people.forEach((person) => {
      if (!this.people.find((p) => p._id === person._id && p.type === person.type)) {
        this.people.push(
          {
            ...person,
            addedAt: Date.now(),
          },
        );
      }
    });

    // if there are over 100 people in the array who are recs, remove the oldest ones

    if (this.people.length > maxPeopleToStore) {
      const recs = this.people.filter((person) => person.type === 'rec')
        .sort((a, b) => a.addedAt - b.addedAt);

      while (recs.length > maxPeopleToStore) {
        const oldestPerson = recs.shift();
        this.people = this.people.filter((person) => person._id !== oldestPerson._id);
      }
    }

    if (debug) console.log('people', this.people);
    if (Date.now() - this.lastSavedTime > 1000 * 60 * 5) {
      this.savePeople();
      this.lastSavedTime = Date.now();
    }
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
        if (person.type !== 'rec') continue;
        const id = extractRecPhotoId(url);
        // search through person's photos
        for (const photo of person.photos) {
          if (extractRecPhotoId(photo.url) === id || photo?.id === id) {
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
      const photoId = extractUuidFromUrl(url);
      for (const person of this.people) {
        // search through person's photos
        for (const photo of person.photos) {
          if (person.type === 'rec') continue;
          if (extractUuidFromUrl(photo.url) === photoId || photo?.id === photoId) {
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

  async savePeople() {
    await this.storage.set('people', this.people);
  }

  async handleProfile(profile: ProfileResponseData) {
    if (debug) console.log('got new profile!', profile);
    const person: Person = profile.user;
    person.type = 'profile';
    this.handleNewPeople([person]);

    // add the country and other misc info to the analytics
    const { cc } = profile.user.pos_info.country;
    const premium = profile.purchase.purchases.length > 0;
    const age = calculateAge(new Date(profile.user.birth_date));
    const ageMax = profile.user.age_filter_max;
    const ageMin = profile.user.age_filter_min;
    const genderCode = profile.user.gender;

    let gender = '';

    if (genderCode === 0) {
      gender = 'male';
    } else if (genderCode === 1) {
      gender = 'female';
    } else {
      gender = 'other';
    }

    const storage = new Storage({
      area: 'sync',
    });

    await storage.set('userStats', {
      cc,
      premium,
      age,
      ageMax,
      ageMin,
      gender,
    } satisfies UserStats);
  }
}
