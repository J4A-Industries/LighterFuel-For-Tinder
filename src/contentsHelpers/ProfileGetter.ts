/* eslint-disable class-methods-use-this */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-underscore-dangle */
import { sendToBackgroundViaRelay } from '@plasmohq/messaging';

import { FetchInterceptor } from '~src/contentsHelpers/FetchInterceptor';
import { debug } from '~src/misc/config';
import type { Person } from '~src/misc/tinderTypes';

export class ProfileGetter {
  constructor(fetchInterceptor: FetchInterceptor) {
    this.initializeHandlers(fetchInterceptor);
  }

  private initializeHandlers(fetchInterceptor: FetchInterceptor) {
    fetchInterceptor.addHandler(
      /https:\/\/api.gotinder.com\/v2\/matches\?/g,
      this.handleNewMatches.bind(this),
    );

    fetchInterceptor.addHandler(
      /https:\/\/api.gotinder.com\/v2\/(?:recs\/)?(core|my-likes)\?/g,
      this.handleNewCore.bind(this),
    );

    fetchInterceptor.addHandler(
      /https:\/\/api.gotinder.com\/v2\/profile\//g,
      this.handleProfile.bind(this),
    );

    fetchInterceptor.addHandler(
      /https:\/\/api.gotinder.com\/v2\/fast-match\?/g,
      this.handleFastMatch.bind(this),
    );

    fetchInterceptor.addHandler(
      /https:\/\/api.gotinder.com\/like\/([A-z0-9]+)\?/g,
      this.handleLike.bind(this),
    );

    fetchInterceptor.addHandler(
      /https:\/\/api.gotinder.com\/user\/([A-z0-9]+)/g,
      this.handleUser.bind(this),
    );
  }

  private handleNewMatches(jsonOut: any) {
    if (!Array.isArray(jsonOut?.data?.matches)) {
      if (debug) console.error('Invalid matches response');
      return;
    }

    const people = jsonOut.data.matches.map((match) => {
      const person = match.user || match.person;
      person.type = 'match';
      return person;
    });

    this.sendPeopleToBackground(people);
  }

  private handleNewCore(jsonOut: any) {
    if (!Array.isArray(jsonOut?.data?.results)) {
      if (debug) console.error('Invalid core response');
      return;
    }

    const people = jsonOut.data.results.map((rec) => {
      const person = rec.user;
      person.type = 'rec';
      return person;
    });

    this.sendPeopleToBackground(people);
  }

  private handleProfile(jsonOut: any) {
    if (!jsonOut.data.user) return;

    sendToBackgroundViaRelay({
      name: 'getProfile',
      body: { profile: jsonOut.data },
    });
  }

  private handleFastMatch(jsonOut: any) {
    if (!Array.isArray(jsonOut?.data?.results)) {
      if (debug) console.error('Invalid fast match response');
      return;
    }

    const people = jsonOut.data.results.map((rec) => {
      const person = rec.user;
      person.type = 'rec';
      return person;
    });

    this.sendPeopleToBackground(people);
  }

  private handleLike(jsonOut: any, url: string) {
    if (!jsonOut.match) return;

    const match = url.match(/like\/([a-zA-Z0-9]+)\?/);
    if (!match) {
      if (debug)
        console.error('Could not find id in url after successful match', url);
      return;
    }

    sendToBackgroundViaRelay({
      name: 'convertPersonType',
      body: { personId: match[1], type: 'match' },
    });
  }

  private handleUser(jsonOut: any) {
    if (!jsonOut.results) {
      if (debug) console.error('Invalid user response');
      return;
    }

    const person = jsonOut.results;
    person.type = 'rec';
    this.sendPeopleToBackground([person]);
  }

  private sendPeopleToBackground(people: Person[]) {
    sendToBackgroundViaRelay({
      name: 'getPeople',
      body: { people },
    });
  }
}
