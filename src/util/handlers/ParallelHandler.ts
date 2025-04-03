import { AsyncHandler } from './AsyncHandler';

import { getLoggerFor } from '../../logging/LogUtil';
/**
 * A composite handler that executes handlers in parallel.
 */
export class ParallelHandler<TIn = void, TOut = void> extends AsyncHandler<TIn, TOut[]> {
  private readonly handlers: AsyncHandler<TIn, TOut>[];
  protected readonly logger = getLoggerFor(this);

  public constructor(handlers: AsyncHandler<TIn, TOut>[]) {
    super();
    this.handlers = [ ...handlers ];
  }

  public async canHandle(input: TIn): Promise<void> {
    await Promise.all(this.handlers.map(async(handler): Promise<void> => handler.canHandle(input)));
  }

  public async handle(input: TIn): Promise<TOut[]> {
    // debug; remove me
    return Promise.all(
      this.handlers.map(
        async(handler): Promise<TOut> => {
          this.logger.debug(`>>> HANDLING ${handler.constructor.name}`)
          try {
            return await handler.handle(input)
          }catch(error){
            this.logger.error(`ErRoR ${handler.constructor.name} : ${error}`)
            throw error
          }
        }));
      
      // return Promise.all(this.handlers.map(async(handler): Promise<TOut> => handler.handle(input)));
    // (14) [WacAllowMetadataWriter
    // , AllowAcceptHeaderWriter
    // , ContentTypeMetadataWriter
    // , LinkRelMetadataWriter
    // , AuxiliaryLinkMetadataWriter
    // , CookieMetadataWriter
    // , MappedMetadataWriter
    // , ModifiedMetadataWriter
    // , RangeMetadataWriter
    // , StorageDescriptionAdvertiser
    // , WwwAuthMetadataWriter
    // , StreamingHttpMetadataWriter
    // , AuxiliaryLinkMetadataWriter
    // , OwnerMetadataWriter]

  }
}
