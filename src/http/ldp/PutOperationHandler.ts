import { getLoggerFor } from '../../logging/LogUtil';
import type { ResourceStore } from '../../storage/ResourceStore';
import { BadRequestHttpError } from '../../util/errors/BadRequestHttpError';
import { MethodNotAllowedHttpError } from '../../util/errors/MethodNotAllowedHttpError';
import { NotImplementedHttpError } from '../../util/errors/NotImplementedHttpError';
import { isContainerPath } from '../../util/PathUtil';
import type { AuxiliaryStrategy } from '../auxiliary/AuxiliaryStrategy';
import { CreatedResponseDescription } from '../output/response/CreatedResponseDescription';
import { ResetResponseDescription } from '../output/response/ResetResponseDescription';
import type { ResponseDescription } from '../output/response/ResponseDescription';
import type { OperationHandlerInput } from './OperationHandler';
import { OperationHandler } from './OperationHandler';
import { readableToBuffer } from './GetOperationHandler';
import { BasicRepresentation } from '../../http/representation/BasicRepresentation';

// Subscription storage: keys are generated by subscription_hash
const subscriptions: { [key: string]: any } = {};

// Generate a subscription key using the request's peer header and url
const subscription_hash = (req: any): string =>
  JSON.stringify([req.headers.peer, req.url]);

/**
 * Handles PUT {@link Operation}s.
 * Calls the setRepresentation function from a {@link ResourceStore}.
 */
export class PutOperationHandler extends OperationHandler {
  protected readonly logger = getLoggerFor(this);

  private readonly store: ResourceStore;
  private readonly metadataStrategy: AuxiliaryStrategy;

  public constructor(store: ResourceStore, metadataStrategy: AuxiliaryStrategy) {
    super();
    this.store = store;
    this.metadataStrategy = metadataStrategy;
  }

  public async canHandle({ operation }: OperationHandlerInput): Promise<void> {
    if (operation.method !== 'PUT') {
      throw new NotImplementedHttpError('This handler only supports PUT operations');
    }
  }

  public async handle({ operation, request }: OperationHandlerInput & { request: any }): Promise<ResponseDescription> {
    const targetIsContainer = isContainerPath(operation.target.path);

    // Solid, §2.1: "A Solid server MUST reject PUT, POST and PATCH requests
    // without the Content-Type header with a status code of 400."
    // https://solid.github.io/specification/protocol#http-server
    // An exception is made for LDP Containers as nothing is done with the body, so a Content-type is not required
    if (!operation.body.metadata.contentType && !targetIsContainer) {
      this.logger.warn('PUT requests require the Content-Type header to be set');
      throw new BadRequestHttpError('PUT requests require the Content-Type header to be set');
    }

    // https://github.com/CommunitySolidServer/CommunitySolidServer/issues/1027#issuecomment-988664970
    // We do not allow PUT on metadata resources for simplicity.
    // Otherwise, all generated metadata triples would have to be identical, such as date modified.
    // We already reject the request here instead of `setRepresentation` so PATCH requests
    // can still use that function to update data.
    if (this.metadataStrategy.isAuxiliaryIdentifier(operation.target)) {
      throw new MethodNotAllowedHttpError(
        ['PUT'],
        'Not allowed to create or edit metadata resources using PUT; use PATCH instead.',
      );
    }

    // Process PATCH updates from PUT requests if available

    // only body stream working for now
    // need to use patches
    // braid doesn't allow patches + body
  let patches, newContent, representation
  if (request.headers.peer && request.patches) {
      patches = await request.patches();

      // Validate that the request contains exactly one patch with the expected properties
      if (patches.length !== 1) {
        throw new BadRequestHttpError('Expected one patch');
      }
      if (patches[0].range !== '[-0:-0]') {
        throw new BadRequestHttpError("Patch range must be '[-0:-0]'");
      }
      if (patches[0].unit !== 'json') {
        throw new BadRequestHttpError("Patch unit must be 'json'");
      }

      // Update the resource with the new content
      newContent = JSON.parse(patches[0].content_text).text;
      // operation.body.data = newContent; // need to get body
      representation = new BasicRepresentation(newContent, {}, true) 
    }else{
      representation = operation.body
    }
    // patches' content needs to be converted to a Representation
    // because that what `setRepresentation` take as argumuent

    // A more efficient approach would be to have the server return metadata indicating if a resource was new
    // See https://github.com/CommunitySolidServer/CommunitySolidServer/issues/632
    const exists = await this.store.hasResource(operation.target);
    await this.store.setRepresentation(operation.target, representation, operation.conditions);

    const body = await this.store.getRepresentation(operation.target, {}, operation.conditions);

    // Broadcast the update to all subscribers for this URL, excluding the sender
    if (request.headers.peer) {
      for (const key in subscriptions) {
        request.body.data.resume();
        const content = (await readableToBuffer(body.data)).toString();
        try {
          const [peer, url] = JSON.parse(key);
          if (url === operation.target.path && peer !== request.headers.peer) {
            subscriptions[key].sendUpdate({
              version: [exists ? '1' : '0'],
              body: JSON.stringify([{ text: content }])
            });
          }
        } catch (err) {
          this.logger.error('Error parsing subscription key:' + err);
        }
      }
    }

    if (exists) {
      return new ResetResponseDescription();
    }
    return new CreatedResponseDescription(operation.target);
  }
}
