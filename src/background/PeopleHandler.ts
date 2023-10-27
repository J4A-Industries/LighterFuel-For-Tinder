/* eslint-disable no-underscore-dangle */
import type { Person } from '~src/misc/tinderTypes';

export class PeopleHandler {
  people: Person[];

  handleNewPeople(people: Person[]) {
    people.forEach((person) => {
      if (!this.people.find((p) => p._id === person._id)) {
        this.people.push(person);
      }
    });
  }
}
