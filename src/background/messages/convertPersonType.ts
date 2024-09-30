/* eslint-disable no-underscore-dangle */
import type { PlasmoMessaging } from '@plasmohq/messaging';
import { peopleHandler } from '..';

export type ConvertPersonTypeRequest = {
	personId: string;
  type: 'rec' | 'profile' | 'match';
};

export type ConvertPersonTypeResponse = {
  received: true;
};

const handler: PlasmoMessaging.MessageHandler<ConvertPersonTypeRequest, ConvertPersonTypeResponse> = async (req, res) => {
  const newPersonRecord = peopleHandler.people.find((p) => p._id === req.body.personId);
  if (!newPersonRecord) {
    console.error('Could not find person with id', req.body.personId);
    return;
  }

  const newPerson = {
    ...newPersonRecord,
    type: req.body.type,
  };

  peopleHandler.people = peopleHandler.people.filter((p) => p._id !== req.body.personId);
  peopleHandler.people.push(newPerson);
  res.send({
    received: true,
  });
};

export default handler;
