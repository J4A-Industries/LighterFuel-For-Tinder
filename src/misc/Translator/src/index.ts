/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
import * as dotenv from 'dotenv';
import tags from 'language-tags';
import fs from 'fs/promises';
import input from './input.json';

const { Translate } = require('@google-cloud/translate').v2;

dotenv.config();

const translate = new Translate(process.env.PROJECT_ID);

const location = 'global';

const init = async () => {
  // The list of languages from the chrome stats csv file
  const languages = ['Arabic', 'Bulgarian', 'Chinese (China)', 'Chinese (Taiwan)', 'Croatian', 'Czech', 'Danish', 'Dutch', 'English', 'English (United Kingdom)', 'English (United States)', 'Estonian', 'Filipino', 'Finnish', 'French', 'German', 'Greek', 'Hindi', 'Hungarian', 'Indonesian', 'Italian', 'Japanese', 'Korean', 'Lithuanian', 'Malay', 'Norwegian', 'Polish', 'Portuguese (Brazil)', 'Portuguese (Portugal)', 'Romanian', 'Russian', 'Serbian', 'Slovak', 'Slovenian', 'Spanish', 'Swahili', 'Swedish', 'Thai', 'Turkish', 'Ukrainian', 'Vietnamese', 'be'];

  const tagArr = [...new Set(languages.reduce((arr, cur) => {
    const record = tags.search(cur)[0];
    if (!record) return arr;
    if ('data' in record) {
      // @ts-ignore
      arr.push(record.data.subtag);
    }
    return arr;
  }, []))];

  console.log(JSON.stringify(tagArr, null, 2));

  // Recursivly go through the input object and translate the values
  const translateObj = async (obj: any, lang: string) => {
    const newObj:any = {};
    for (const key in Object.keys(obj)) {
      if (typeof obj[key] === 'object') {
        newObj[key] = await translateObj(obj[key], lang);
      } else {
        newObj[key] = await translate(obj[key], { from: 'en', to: lang });
      }
    }
    return newObj;
  };

  const translated = await translate(input, 'en');

  // save the translated object to a json file
  await fs.writeFile('./output.json', JSON.stringify(translated, null, 2));
  console.log('done');

  /* translator
    .translate('Hello world', 'en', languageCodes[0])
    .then((translate) => console.log('Translate result', translate)); */
};

init();
