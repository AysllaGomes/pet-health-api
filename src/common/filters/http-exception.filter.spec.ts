import {
  ArgumentsHost,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';

import { HttpExceptionFilter } from './http-exception.filter';

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;

  const mockJson = jest.fn();
  const mockStatus = jest.fn(() => ({
    json: mockJson,
  }));

  const responseMock = {
    status: mockStatus,
  };

  const requestMock = {
    url: '/pets/123',
  };

  const hostMock = {
    switchToHttp: () => ({
      getResponse: () => responseMock,
      getRequest: () => requestMock,
    }),
  } as ArgumentsHost;

  beforeEach(() => {
    filter = new HttpExceptionFilter();
    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(filter).toBeDefined();
  });

  it('deve formatar NotFoundException', () => {
    const exception = new NotFoundException('Pet não encontrado.');

    filter.catch(exception, hostMock);

    expect(mockStatus).toHaveBeenCalledWith(404);
    expect(mockJson).toHaveBeenCalledWith({
      statusCode: 404,
      message: 'Pet não encontrado.',
      error: 'Not Found',
      path: '/pets/123',
      timestamp: expect.any(String),
    });
  });

  it('deve formatar BadRequestException com lista de mensagens', () => {
    const exception = new BadRequestException({
      message: ['email must be an email'],
      error: 'Bad Request',
    });

    filter.catch(exception, hostMock);

    expect(mockStatus).toHaveBeenCalledWith(400);
    expect(mockJson).toHaveBeenCalledWith({
      statusCode: 400,
      message: ['email must be an email'],
      error: 'Bad Request',
      path: '/pets/123',
      timestamp: expect.any(String),
    });
  });

  it('deve tratar erro interno não esperado', () => {
    filter.catch(new Error('erro inesperado'), hostMock);

    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(mockJson).toHaveBeenCalledWith({
      statusCode: 500,
      message: 'Internal server error',
      error: 'Internal Server Error',
      path: '/pets/123',
      timestamp: expect.any(String),
    });
  });
});
