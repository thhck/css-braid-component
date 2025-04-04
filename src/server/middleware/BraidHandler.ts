import type { HttpHandlerInput } from '../HttpHandler';
import { HttpHandler } from '../HttpHandler';
import { http_server as braidify } from 'braid-http'



/**
* TODO
 */
export class BraidHandler extends HttpHandler {
    private readonly braidify: any;
  public constructor() {
    super();
    this.braidify = braidify
    this.braidify.enable_multiplex = false
  }

  public async handle(input: HttpHandlerInput): Promise<void> {
    return new Promise((resolve): void => {
      // this.braidHandler(input.request, input.response, (): void => resolve());
      this.braidify(input.request, input.response, (): void => resolve());
    });
  }
}
