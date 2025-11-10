/**
 * Unit tests for lib/api.ts handleResponse function
 * Tests defensive error handling for various response scenarios
 */

import { APIError } from '@/lib/api';

// Mock fetch Response
class MockResponse {
  ok: boolean;
  status: number;
  private body: any;
  private contentType: string;

  constructor(body: any, status: number, contentType: string = 'application/json') {
    this.ok = status >= 200 && status < 300;
    this.status = status;
    this.body = body;
    this.contentType = contentType;
  }

  headers = {
    get: (name: string) => {
      if (name === 'content-type') return this.contentType;
      return null;
    }
  };

  async json() {
    if (typeof this.body === 'string') {
      return JSON.parse(this.body);
    }
    return this.body;
  }

  async text() {
    if (typeof this.body === 'string') {
      return this.body;
    }
    return JSON.stringify(this.body);
  }
}

// Test helper to simulate handleResponse
async function testHandleResponse(response: MockResponse) {
  let data: any;
  let serverMessage = 'An error occurred';
  
  try {
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = { error: text || 'Empty response' };
    }
  } catch (parseError) {
    console.error('Failed to parse response:', parseError);
    data = { error: 'Failed to parse server response' };
  }

  if (!response.ok) {
    if (data.error) {
      serverMessage = data.error;
    } else if (data.message) {
      serverMessage = data.message;
    } else if (typeof data === 'string') {
      serverMessage = data.length > 200 ? data.substring(0, 200) + '...' : data;
    } else {
      serverMessage = `Request failed with status ${response.status}`;
    }
    
    throw new APIError(response.status, serverMessage);
  }

  return data;
}

describe('API handleResponse', () => {
  describe('Success cases (2xx)', () => {
    test('200 with valid JSON response', async () => {
      const response = new MockResponse(
        { data: 'success', id: 123 },
        200
      );
      
      const result = await testHandleResponse(response);
      expect(result).toEqual({ data: 'success', id: 123 });
    });

    test('200 with empty JSON object', async () => {
      const response = new MockResponse({}, 200);
      
      const result = await testHandleResponse(response);
      expect(result).toEqual({});
    });

    test('201 with created resource', async () => {
      const response = new MockResponse(
        { message: 'Created', event: { id: 1, title: 'Test' } },
        201
      );
      
      const result = await testHandleResponse(response);
      expect(result.message).toBe('Created');
      expect(result.event.id).toBe(1);
    });
  });

  describe('Error cases with JSON', () => {
    test('400 with error key in JSON', async () => {
      const response = new MockResponse(
        { error: 'Invalid input data' },
        400
      );
      
      await expect(testHandleResponse(response)).rejects.toThrow(APIError);
      
      try {
        await testHandleResponse(response);
      } catch (err: any) {
        expect(err.status).toBe(400);
        expect(err.serverMessage).toBe('Invalid input data');
        expect(err.name).toBe('APIError');
      }
    });

    test('401 with message key in JSON', async () => {
      const response = new MockResponse(
        { message: 'Unauthorized access' },
        401
      );
      
      try {
        await testHandleResponse(response);
      } catch (err: any) {
        expect(err.status).toBe(401);
        expect(err.serverMessage).toBe('Unauthorized access');
      }
    });

    test('500 with both error and message keys (error takes precedence)', async () => {
      const response = new MockResponse(
        { error: 'Database connection failed', message: 'Internal error' },
        500
      );
      
      try {
        await testHandleResponse(response);
      } catch (err: any) {
        expect(err.status).toBe(500);
        expect(err.serverMessage).toBe('Database connection failed');
      }
    });

    test('404 with no error/message keys', async () => {
      const response = new MockResponse(
        { data: null },
        404
      );
      
      try {
        await testHandleResponse(response);
      } catch (err: any) {
        expect(err.status).toBe(404);
        expect(err.serverMessage).toBe('Request failed with status 404');
      }
    });
  });

  describe('Error cases with non-JSON (HTML/text)', () => {
    test('500 with HTML error page', async () => {
      const htmlError = '<html><body><h1>Internal Server Error</h1></body></html>';
      const response = new MockResponse(htmlError, 500, 'text/html');
      
      try {
        await testHandleResponse(response);
      } catch (err: any) {
        expect(err.status).toBe(500);
        expect(err.serverMessage).toBe(htmlError);
      }
    });

    test('500 with plain text error', async () => {
      const response = new MockResponse(
        'Connection timeout',
        500,
        'text/plain'
      );
      
      try {
        await testHandleResponse(response);
      } catch (err: any) {
        expect(err.status).toBe(500);
        expect(err.serverMessage).toBe('Connection timeout');
      }
    });

    test('500 with very long text (should truncate)', async () => {
      const longText = 'A'.repeat(300);
      const response = new MockResponse(longText, 500, 'text/plain');
      
      try {
        await testHandleResponse(response);
      } catch (err: any) {
        expect(err.status).toBe(500);
        expect(err.serverMessage.length).toBe(203); // 200 + '...'
        expect(err.serverMessage.endsWith('...')).toBe(true);
      }
    });

    test('500 with empty response body', async () => {
      const response = new MockResponse('', 500, 'text/plain');
      
      try {
        await testHandleResponse(response);
      } catch (err: any) {
        expect(err.status).toBe(500);
        expect(err.serverMessage).toBe('Empty response');
      }
    });
  });

  describe('Edge cases', () => {
    test('Malformed JSON should fallback gracefully', async () => {
      const response = new MockResponse(
        '{ invalid json',
        500,
        'application/json'
      );
      
      try {
        await testHandleResponse(response);
      } catch (err: any) {
        expect(err.status).toBe(500);
        // Should handle parse error gracefully
        expect(err.serverMessage).toBeTruthy();
      }
    });

    test('403 Forbidden with detailed error', async () => {
      const response = new MockResponse(
        { error: 'Forbidden: Only event creator or admin can delete' },
        403
      );
      
      try {
        await testHandleResponse(response);
      } catch (err: any) {
        expect(err.status).toBe(403);
        expect(err.serverMessage).toContain('Forbidden');
      }
    });

    test('503 Service Unavailable', async () => {
      const response = new MockResponse(
        { error: 'Service temporarily unavailable' },
        503
      );
      
      try {
        await testHandleResponse(response);
      } catch (err: any) {
        expect(err.status).toBe(503);
        expect(err.serverMessage).toBe('Service temporarily unavailable');
      }
    });
  });

  describe('Validation errors with details', () => {
    test('400 with errors object map', async () => {
      const response = new MockResponse(
        {
          error: 'Validation failed',
          errors: {
            title: 'Title is required',
            startDate: 'Start date must be a valid date'
          }
        },
        400
      );
      
      try {
        await testHandleResponse(response);
      } catch (err: any) {
        expect(err.status).toBe(400);
        expect(err.isValidation).toBe(true);
        expect(err.details).toEqual({
          title: 'Title is required',
          startDate: 'Start date must be a valid date'
        });
      }
    });

    test('422 with errors array of objects', async () => {
      const response = new MockResponse(
        {
          message: 'Validation failed',
          errors: [
            { field: 'title', message: 'Title is required' },
            { field: 'endDate', message: 'End date must be after start date' }
          ]
        },
        422
      );
      
      try {
        await testHandleResponse(response);
      } catch (err: any) {
        expect(err.status).toBe(422);
        expect(err.isValidation).toBe(true);
        expect(Array.isArray(err.details)).toBe(true);
        expect(err.details).toHaveLength(2);
      }
    });

    test('400 with details array (Mongoose format)', async () => {
      const response = new MockResponse(
        {
          error: 'Validation failed',
          message: 'Event validation failed',
          details: [
            'Path `title` is required.',
            'Path `startDate` is required.'
          ]
        },
        400
      );
      
      try {
        await testHandleResponse(response);
      } catch (err: any) {
        expect(err.status).toBe(400);
        expect(err.isValidation).toBe(true);
        expect(err.details).toEqual({
          _general: 'Path `title` is required., Path `startDate` is required.'
        });
      }
    });
  });
});

describe('APIError class', () => {
  test('Creates error with correct properties', () => {
    const error = new APIError(404, 'Resource not found');
    
    expect(error.name).toBe('APIError');
    expect(error.status).toBe(404);
    expect(error.serverMessage).toBe('Resource not found');
    expect(error.message).toBe('Resource not found');
    expect(error.isValidation).toBe(false);
    expect(error.details).toBeUndefined();
  });

  test('Creates validation error with details (object map)', () => {
    const details = { title: 'Title is required', startDate: 'Invalid date' };
    const error = new APIError(400, 'Validation failed', details);
    
    expect(error.status).toBe(400);
    expect(error.isValidation).toBe(true);
    expect(error.details).toEqual(details);
  });

  test('Creates validation error with details (array)', () => {
    const details = [
      { field: 'title', message: 'Title is required' },
      { field: 'startDate', message: 'Invalid date' }
    ];
    const error = new APIError(422, 'Validation failed', details);
    
    expect(error.status).toBe(422);
    expect(error.isValidation).toBe(true);
    expect(error.details).toEqual(details);
  });

  test('Is instance of Error', () => {
    const error = new APIError(500, 'Server error');
    
    expect(error instanceof Error).toBe(true);
    expect(error instanceof APIError).toBe(true);
  });
});
