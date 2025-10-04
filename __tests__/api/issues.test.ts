import { createMocks } from 'node-mocks-http';
import handler from '../../app/api/issues/route';

// Mock NextAuth
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(() => ({
    user: {
      id: '507f1f77bcf86cd799439011',
      email: 'test@example.com',
      role: 'Staff',
      stationId: '507f1f77bcf86cd799439012',
    },
  })),
}));

// Mock database connection
jest.mock('../../lib/db', () => ({
  __esModule: true,
  default: jest.fn(),
}));

// Mock models
jest.mock('../../models/Issue', () => ({
  find: jest.fn(),
  create: jest.fn(),
}));

jest.mock('../../models/Station', () => ({
  findById: jest.fn(),
}));

jest.mock('../../lib/mailer', () => ({
  sendIssueAlert: jest.fn(),
}));

describe('/api/issues', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('should return issues for authenticated user', async () => {
      const { Issue } = require('../../models/Issue');
      const mockIssues = [
        {
          _id: '507f1f77bcf86cd799439011',
          description: 'Test issue',
          priority: 'high',
          status: 'reported',
          stationId: { name: 'Test Station' },
          reportedById: { name: 'Test User' },
        },
      ];

      Issue.find.mockResolvedValue(mockIssues);

      const { req, res } = createMocks({
        method: 'GET',
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual(mockIssues);
    });

    it('should return 401 for unauthenticated user', async () => {
      const { getServerSession } = require('next-auth');
      getServerSession.mockResolvedValue(null);

      const { req, res } = createMocks({
        method: 'GET',
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(401);
    });
  });

  describe('POST', () => {
    it('should create a new issue', async () => {
      const { Issue } = require('../../models/Issue');
      const { Station } = require('../../models/Station');
      const { sendIssueAlert } = require('../../lib/mailer');

      const mockIssue = {
        _id: '507f1f77bcf86cd799439011',
        description: 'Test issue',
        priority: 'high',
        status: 'reported',
        stationId: { _id: '507f1f77bcf86cd799439012', name: 'Test Station' },
        reportedById: { _id: '507f1f77bcf86cd799439011', name: 'Test User' },
      };

      const mockStation = {
        _id: '507f1f77bcf86cd799439012',
        name: 'Test Station',
      };

      Issue.create.mockResolvedValue(mockIssue);
      Station.findById.mockResolvedValue(mockStation);
      sendIssueAlert.mockResolvedValue({ success: true });

      const { req, res } = createMocks({
        method: 'POST',
        body: {
          stationId: '507f1f77bcf86cd799439012',
          priority: 'high',
          description: 'Test issue description',
          photos: [],
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(201);
      expect(JSON.parse(res._getData())).toEqual(mockIssue);
      expect(sendIssueAlert).toHaveBeenCalledWith(mockIssue, mockStation);
    });

    it('should return 400 for invalid data', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          // Missing required fields
          priority: 'high',
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
    });
  });
});
