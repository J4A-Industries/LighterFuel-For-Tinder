import { sendToBackgroundViaRelay } from '@plasmohq/messaging';
import type { CoreRec } from '../misc/tinderTypes';
import type { ShowSettings } from '../misc/types';
import { regexChecks } from './ProfileGetter';

class ResponseModifier {
  settings: ShowSettings;

  constructor() {
    this.getShowSettings();
  }

  async handleRequest(url: string, response: Response) {
    // only run on the core recs request.
    if (url.match(regexChecks.core)) {
      const newRes = await this.modifyCoreResponse(response);
      return newRes;
    }

    return response;
  }

  getShowSettings() {
    sendToBackgroundViaRelay({
      name: 'getPeople',
    }).then((res) => {
      this.settings = res;

      console.log('SHOW SETTINGS:', res);
    });
  }

  async modifyCoreResponse(response: Response) {
    // map out the data.results array

    const resJson = await response.json();

    if (resJson?.data?.results) {
      resJson.data.results = resJson.data.results.map((coreRec: CoreRec) => this.handleSuperLikeUpsell(coreRec));
    }

    const modifiedResponse = new Response(JSON.stringify(resJson), response);

    return modifiedResponse;
  }

  handleSuperLikeUpsell(coreRec: CoreRec): CoreRec {
    console.log('handleSuperLikeUpsell', coreRec, this.settings);
    return coreRec;
    // return {
    //   ...coreRec,
    //   is_superlike_upsell: this.settings.disableSuperLikeUpsell ? false : coreRec.is_superlike_upsell,
    // };
  }
}

export default ResponseModifier;
