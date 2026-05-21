/**
 * BackendDeveloperAgent - James Liu
 * 12 years of experience in Backend Development
 * 
 * ⚠️ SCOPE OF WORK (DO NOT GO BEYOND THIS):
 * - Write backend code (Node.js, Python, Go, etc.)
 * - Design database schemas
 * - Implement APIs and business logic
 * - Data integrity and validation
 * - Backend testing
 * 
 * ❌ DO NOT DO:
 * - Write business requirements (Product Manager)
 * - Design UI/UX (UX Designer)
 * - Write frontend code (Frontend Developer)
 * - Setup infrastructure (DevOps)
 * - Security testing (Security Engineer)
 * - Mobile development (Mobile Developer)
 */

import { BaseAgent } from './base-agent.js';
import { AgentRole } from '../types/index.js';

export class BackendDeveloperAgent extends BaseAgent {
  constructor() {
    super(AgentRole.BACKEND_DEVELOPER);
  }

  protected getSystemPrompt(): string {
    return `You are **James Liu**, a Senior Backend Developer with 12 years of experience building scalable server applications.

## Your Profile
- **Name**: James Liu
- **Experience**: 12 years in Backend Development
- **Expertise**: Node.js/Python/Go, Database Design, API Development, Authentication/Authorization, Caching Strategies, Message Queues, Scalability Patterns, Security

## Your Responsibilities
1. Design and implement RESTful/GraphQL APIs
2. Design database schemas (SQL and NoSQL)
3. Implement business logic and domain models
4. Ensure data integrity and consistency
5. Optimize database queries for performance
6. Implement authentication and authorization
7. Design for scalability and resilience
8. Write comprehensive backend tests

## Your Work Style
- API-first design philosophy
- Data consistency advocate
- Security-conscious by default
- Performance-aware (indexes, caching, query optimization)
- Prefers clean architecture (separation of concerns)
- Documentation driven

## Technical Expertise

### API Design
- RESTful best practices (proper HTTP methods, status codes)
- GraphQL for complex data requirements
- OpenAPI/Swagger documentation
- API versioning strategies
- Rate limiting and throttling
- Pagination (cursor-based for large datasets)

### Database Design
- SQL: PostgreSQL, MySQL (normalization, indexes, views)
- NoSQL: MongoDB, Redis
- Data modeling for access patterns
- Migration strategies
- Backup and recovery planning
- Query optimization (EXPLAIN ANALYZE)

### Authentication & Security
- JWT tokens (access + refresh)
- OAuth 2.0 (Authorization Code, Client Credentials)
- Session management
- Password hashing (bcrypt, argon2)
- Input validation (Zod, Joi)
- SQL injection prevention
- XSS prevention
- CSRF protection

### Caching & Performance
- Redis for session, cache, rate limiting
- Cache invalidation strategies
- Database connection pooling
- Query optimization
- Async processing (queues)
- Bulk operations

### Architecture Patterns
- Clean Architecture / Layered Architecture
- Repository Pattern
- Event-driven architecture
- Microservices communication
- Saga pattern for distributed transactions

## Code Standards
- TypeScript strict mode
- Comprehensive error handling
- Logging (structured JSON logs)
- Input validation at every boundary
- Unit tests for business logic
- Integration tests for APIs

## Communication Style
- Schema-focused - shares DB diagrams, API contracts early
- Discusses data models and relationships
- Explains trade-offs between data consistency and performance
- Documents database decisions
- Provides estimated effort for backend tasks

Remember: You have 12 years of experience. You know that the backend is the foundation everything else rests on. Security is not optional, data integrity is paramount, and the best APIs are the ones that feel intuitive to their consumers.`;
  }

  /**
   * Design and implement API endpoint
   */
  async implementAPIEndpoint(
    endpointSpec: string,
    techStack: 'nodejs' | 'python' | 'go' = 'nodejs'
  ): Promise<{
    endpointCode: string;
    validation: string;
    errorHandling: string;
    tests: string;
  }> {
    const result = await this.execute(`
      Implement a ${techStack} API endpoint based on:
      
      ${endpointSpec}
      
      Include:
      1. Route handler with proper HTTP methods/status codes
      2. Input validation (Zod/Joi/Pydantic)
      3. Error handling with appropriate error types
      4. Logging
      5. Unit tests
    `);

    return {
      endpointCode: result.data as string,
      validation: '',
      errorHandling: '',
      tests: '',
    };
  }

  /**
   * Design database schema
   */
  async designDatabaseSchema(
    feature: string,
    requirements: string,
    dbType: 'postgresql' | 'mongodb' = 'postgresql'
  ): Promise<{
    schema: string;
    indexes: string[];
    migrations: string;
    seedData?: string;
  }> {
    const result = await this.execute(`
      Design a ${dbType} database schema for: ${feature}
      
      Requirements:
      ${requirements}
      
      Provide:
      1. Schema definition (CREATE TABLE or Mongoose schema)
      2. Indexes for query optimization
      3. Migration files
      4. Relationships and foreign keys
      5. Seed data for testing
    `);

    return {
      schema: result.data as string,
      indexes: [],
      migrations: '',
    };
  }

  /**
   * Implement authentication system
   */
  async implementAuthentication(
    authType: 'jwt' | 'oauth' | 'session',
    requirements: string
  ): Promise<{
    implementation: string;
    middleware: string;
    securityMeasures: string[];
  }> {
    const result = await this.execute(`
      Implement ${authType} authentication:
      
      Requirements:
      ${requirements}
      
      Include:
      1. Authentication logic
      2. Middleware for protected routes
      3. Token handling (generation, validation, refresh)
      4. Security best practices
      5. Password hashing
    `);

    return {
      implementation: result.data as string,
      middleware: '',
      securityMeasures: [],
    };
  }

  /**
   * Optimize database queries
   */
  async optimizeQueries(
    slowQueries: string[],
    context: string
  ): Promise<{
    analysis: string;
    optimizedQueries: string[];
    indexRecommendations: string[];
    expectedImprovement: string;
  }> {
    const result = await this.execute(`
      Analyze and optimize these database queries:
      
      ${slowQueries.map((q, i) => `Query ${i + 1}: ${q}`).join('\n')}
      
      Context: ${context}
      
      Include:
      1. Analysis of why queries are slow
      2. Optimized query versions
      3. Index recommendations
      4. Expected performance improvement
    `);

    return {
      analysis: result.data as string,
      optimizedQueries: [],
      indexRecommendations: [],
      expectedImprovement: '',
    };
  }

  /**
   * Implement caching strategy
   */
  async implementCaching(
    feature: string,
    cacheType: 'redis' | 'memory' = 'redis'
  ): Promise<{
    cachingLogic: string;
    invalidationStrategy: string;
    configuration: string;
  }> {
    const result = await this.execute(`
      Implement caching for: ${feature}
      
      Cache type: ${cacheType}
      
      Consider:
      1. What to cache (queries, computations, sessions)
      2. Cache key strategy
      3. TTL (Time To Live)
      4. Invalidation strategy
      5. Cache warming
      6. Error handling when cache is unavailable
    `);

    return {
      cachingLogic: result.data as string,
      invalidationStrategy: '',
      configuration: '',
    };
  }

  /**
   * Create comprehensive API documentation
   */
  async createAPIDocumentation(
    endpoints: Array<{
      method: string;
      path: string;
      description: string;
      requestBody?: object;
      responseBody?: object;
    }>
  ): Promise<{
    openApiSpec: string;
    usageExamples: string;
  }> {
    const result = await this.execute(`
      Create OpenAPI documentation for these endpoints:
      
      ${JSON.stringify(endpoints, null, 2)}
      
      Include:
      1. OpenAPI 3.0 YAML/JSON spec
      2. Request/response schemas
      3. Authentication requirements
      4. Error codes
      5. Usage examples (curl, JavaScript)
    `);

    return {
      openApiSpec: result.data as string,
      usageExamples: '',
    };
  }
}
