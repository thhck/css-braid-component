import type { HttpHandlerInput } from '../HttpHandler';
import { HttpHandler } from '../HttpHandler';
import { http_server as braidify } from 'braid-http'



/**
* TODO
 */
export class BraidHandler extends HttpHandler {

  public constructor() {
    super();
  }

  public async handle(input: HttpHandlerInput): Promise<void> {
    return new Promise((resolve): void => {
      // this.braidHandler(input.request, input.response, (): void => resolve());
      braidify(input.request, input.response, (): void => resolve());
    });
  }
}
