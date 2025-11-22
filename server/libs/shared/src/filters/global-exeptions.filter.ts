import { ArgumentsHost, BadRequestException, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Response, Request } from 'express';

@Catch()
export class GlobalExeptionFilter<T> implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExeptionFilter.name);

  catch(exception: T, host: ArgumentsHost) {
    this.logger.error(exception);

    const ctx = host.switchToHttp();
    const resp = ctx.getResponse() as Response;
    const req = ctx.getRequest() as Request;

    const status = exception instanceof HttpException ? 
        exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    const errMsg = this.getErrorMessage(exception);

    resp.status(status).json(this.setResponse(status, req, exception, errMsg));
    
  }

  private getErrorMessage(exception: any): string {
    if (exception instanceof BadRequestException) {
      const response = exception.getResponse();
      
      // ValidationPipe case
      if (typeof response === 'object' && response !== null && 'message' in response) {
        if (typeof response['message'] === "string") {
          return response['message'];
        }
        return (response['message'] as string[]).join("; ");
      }
    }
    
    if (exception instanceof HttpException) {
      return exception.message;
    }
    
    if (exception instanceof Error) {
      return exception.message;
    }
    
    return 'An unexpected error occurred';
  }

  private setResponse(status: number, req: Request, e: any, msg: string) {
    return {
        statusCode: status,
        ts: new Date().getTime(),
        path: req?.url,
        method: req?.method,
        params: req?.params,
        query: req?.query,
        exeption: {
          name: e["name"],
          message: msg
        }
    }
  }
}
