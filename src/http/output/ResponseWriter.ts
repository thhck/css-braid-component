import type { HttpResponse } from '../../server/HttpResponse';
import { AsyncHandler } from '../../util/handlers/AsyncHandler';
import type { ResponseDescription } from './response/ResponseDescription';

import type { BraidHttpRequest, BraidHttpResponse } from './BasicResponseWriter'

/**
 * Writes the ResponseDescription to the HttpResponse.
 */
export abstract class ResponseWriter
  extends AsyncHandler<{ response: BraidHttpResponse; request?: BraidHttpRequest; result: ResponseDescription }> {}
