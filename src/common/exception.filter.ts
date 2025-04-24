import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  HttpException,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { PrismaClientKnownRequestError, PrismaClientValidationError } from '@prisma/client/runtime/library';
import { PrismaClientInitializationError } from '@prisma/client/runtime/library';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal Server Error';
    let name = '';
    let stack = undefined;

    if (exception instanceof PrismaClientInitializationError) {
      status = HttpStatus.SERVICE_UNAVAILABLE;
      message = 'Database connection error';
      name = exception.name;
      stack = exception.stack;
    } else if (exception instanceof PrismaClientKnownRequestError) {
      status = HttpStatus.BAD_REQUEST;
      message = this.handlePrismaError(exception);
      name = exception.name;
      stack = exception.stack;
    } else if (exception instanceof PrismaClientValidationError) {
      status = HttpStatus.UNPROCESSABLE_ENTITY;
      message = `Validation error: ${exception.message}`;
      name = exception.name;
      stack = exception.stack;
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      message = typeof res === 'string' ? res : (res as any)?.message || message;
      name = exception.name;
      stack = exception.stack;
    } else if (
      exception instanceof Error &&
      exception.message &&
      exception.message.toLowerCase().includes('cloudinary')
    ) {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = `Error uploading files to Cloudinary: ${exception.message}`;
      name = exception.name;
      stack = exception.stack;
    } else if (exception instanceof Error) {
      message = exception.message;
      name = exception.name;
      stack = exception.stack;
    }

    this.logger.error(
      `[${status}] ${request.method} ${request.url} - ${message}`,
      JSON.stringify({
        user: (request.user as any)?.id || 'Unknown user',
        body: request.body,
        stack,
      }),
    );

    response.status(status).json({
      statusCode: status,
      name,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    });
  }

  private handlePrismaError(error: PrismaClientKnownRequestError): string {
    switch (error.code) {
      case 'P2002':
        return 'Duplicate record (unique constraint violation)';
      case 'P2025':
        return 'Record not found';
      default:
        return 'Database connection error';
    }
  }
}
