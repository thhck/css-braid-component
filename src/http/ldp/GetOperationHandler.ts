import type { ETagHandler } from '../../storage/conditions/ETagHandler';
import type { ResourceStore } from '../../storage/ResourceStore';
import { NotImplementedHttpError } from '../../util/errors/NotImplementedHttpError';
import { assertReadConditions } from '../../util/ResourceUtil';
import { OkResponseDescription } from '../output/response/OkResponseDescription';
import type { ResponseDescription } from '../output/response/ResponseDescription';
import type { OperationHandlerInput } from './OperationHandler';
import { OperationHandler } from './OperationHandler';
import { getLoggerFor } from '../../logging/LogUtil';
import { readableToQuads, readJsonStream } from '../../util/StreamUtil';
import { ReadStream } from 'node:fs';
import { Guarded } from '../../util/GuardedStream';
import { Readable } from 'node:stream';

// Subscription storage: keys are generated by subscription_hash
const subscriptions: { [key: string]: any } = {};

// Generate a subscription key using the request's peer header and url
const subscription_hash = (req: any): string =>
  JSON.stringify([req.headers.peer, req.url]);

var resources = [
      {text: 'Hello!'},
      {text: 'This is a post!'},
      {text: 'This is a post-modern!'}
  ]


/**
 * Handles GET {@link Operation}s.
 * Calls the getRepresentation function from a {@link ResourceStore}.
 */
export class GetOperationHandler extends OperationHandler {
  protected readonly logger = getLoggerFor(this);
  private readonly store: ResourceStore;
  private readonly eTagHandler: ETagHandler;

  public constructor(store: ResourceStore, eTagHandler: ETagHandler) {
    super();
    this.store = store;
    this.eTagHandler = eTagHandler;
  }

  public async canHandle(input: OperationHandlerInput): Promise<void> {
    const { operation } = input;
    if (operation.method !== 'GET') {
      throw new NotImplementedHttpError('This handler only supports GET operations');
    }
  }

  public async handle(input: OperationHandlerInput): Promise<ResponseDescription> {
    const { operation, request, response } = input as OperationHandlerInput & { request: any, response: any };
    const body = await this.store.getRepresentation(operation.target, operation.preferences, operation.conditions);

    // Check whether the cached representation is still valid or it is necessary to send a new representation
    assertReadConditions(body, this.eTagHandler, operation.conditions);

    // If the request is a subscription, start it and store the response
    if (request.subscribe) {
      response.startSubscription({
        onClose: () => {
          delete subscriptions[subscription_hash(request)];
          this.logger.info(`Subscription closed for hash ${subscription_hash(request)}`);
        }
      });
      subscriptions[subscription_hash(request)] = response;
      this.logger.info(`Subscribing at hash ${subscription_hash(request)}`);
    } else {
      response.statusCode = 200;
    }
    const isBraidRequest = (request: any) => request.headers.peer ? true : false;
    // Send the current data as the update payload
    if (isBraidRequest(request) && response.sendUpdate) {
      const eTag = this.eTagHandler.getETag(body.metadata);
      
      let content;
      
      // Ensure stream is in flowing mode and collect data
      body.data.resume();
      content = await readableToBuffer(body.data);
      content = content.toString();
      
      response.sendUpdate({
        version: [eTag || '0'],
        body: JSON.stringify([{text: content}])

      });
    }

    // Properly handle response ending based on request type
    if (!request.subscribe) {
      response.end();
    }
    
    return new OkResponseDescription(body.metadata, body.data);
  }

}
/** Helper to collect stream data into a Buffer */
export async function readableToBuffer(stream: Guarded<Readable>): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on('data', (chunk:any) => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });
}

