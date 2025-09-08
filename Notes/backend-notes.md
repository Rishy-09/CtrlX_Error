# Backend Documentation

## Project Overview
The backend is built using Node.js with Express.js framework, implementing a RESTful API for a bug tracking system. It uses MongoDB as the database and includes features for user management, bug tracking, real-time chat, and reporting. The application follows a modular architecture with clear separation of concerns.

## Tech Stack
- **Runtime**: Node.js
- **Framework**: Express.js 5.1.0
- **Database**: MongoDB 6.15.0 with Mongoose 8.13.3
- **Authentication**: JWT (jsonwebtoken 9.0.2)
- **File Handling**: Multer 1.4.5-lts.2
- **Password Hashing**: bcryptjs 3.0.2
- **Excel Handling**: exceljs 4.4.0
- **HTTP Client**: axios 1.9.0
- **Error Handling**: express-async-handler 1.2.0
- **Environment Management**: dotenv 16.4.7
- **CORS**: cors 2.8.5
- **Development**: nodemon 3.1.9

## Project Structure
```
backend/
├── config/           # Configuration files
│   └── db.js        # Database connection setup
├── controllers/      # Route controllers
│   ├── authController.js
│   ├── bugController.js
│   ├── chatController.js
│   ├── reportController.js
│   └── userController.js
├── middlewares/      # Custom middleware
│   ├── auth.js      # Authentication middleware
│   └── upload.js    # File upload middleware
├── models/          # Database models
│   ├── Bug.js
│   ├── Chat.js
│   ├── Message.js
│   └── User.js
├── routes/          # API routes
│   ├── authRoutes.js
│   ├── bugRoutes.js
│   ├── chatRoutes.js
│   ├── reportRoutes.js
│   └── userRoutes.js
├── services/        # Business logic
├── uploads/         # File upload directory
├── server.js        # Application entry point
└── package.json     # Project dependencies
```

## Core Components

### 1. Server Configuration (`server.js`)
- **Express Setup**:
  - CORS configuration with specific options:
    ```javascript
    cors({ 
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"]
    })
    ```
  - JSON body parsing
  - Static file serving for uploads
  - Route mounting with API versioning
- **Environment Variables**:
  - Port configuration (default: 5000)
  - MongoDB URI
  - JWT secret
  - File upload settings
- **Middleware Integration**:
  - Error handling
  - Request logging
  - Security headers
  - File upload handling

### 2. Database Models

#### User Model (`models/User.js`)
- **Schema Fields**:
  - `name`: String (required)
  - `email`: String (required, unique)
  - `password`: String (required, hashed)
  - `role`: String (enum: ["admin", "tester", "developer"], default: "tester")
  - `profileImageURL`: String (optional, default: null)
  - `createdAt`: Date (auto-generated timestamp)
  - `updatedAt`: Date (auto-generated timestamp)
- **Methods**:
  - Password hashing using bcryptjs
  - JWT token generation
  - Profile update validation
- **Indexes**:
  - Unique index on email
  - Index on role for faster queries
- **Timestamps**:
  - Automatically tracks creation and update times

#### Bug Model (`models/Bug.js`)
- **Schema Fields**:
  - `title`: String (required, min 5 chars, trimmed)
  - `description`: String (required, min 10 chars, trimmed)
  - `priority`: String (enum: ["Low", "Medium", "High"], default: "Medium")
  - `severity`: String (enum: ["Minor", "Major", "Critical"], default: "Minor")
  - `status`: String (enum: ["Open", "In Progress", "Closed"], default: "Open")
  - `dueDate`: Date (optional, must be future date)
  - `module`: String (optional, trimmed)
  - `createdBy`: ObjectId (ref: User, required)
  - `assignedTo`: [ObjectId] (ref: User, required - at least one developer)
  - `attachments`: [String] (trimmed file paths)
  - `lastUpdatedBy`: ObjectId (ref: User, tracks last modifier)
  - `checklist`: [{
      text: String (required, trimmed),
      completed: Boolean (default: false),
      completedBy: ObjectId (ref: User),
      completedAt: Date
    }]
  - `updateHistory`: [{
      field: String,
      oldValue: Mixed,
      newValue: Mixed,
      updatedBy: ObjectId (ref: User),
      updatedAt: Date (default: now)
    }]
  - `createdAt`: Date (auto-generated timestamp)
  - `updatedAt`: Date (auto-generated timestamp)
- **Features**:
  - Automatic update tracking via pre-save middleware
  - Text search indexing on title and description
  - Status transition validation
  - Due date validation (future dates only)
  - Checklist management with completion tracking
  - Comprehensive update history
- **Indexes**:
  - Compound index on (createdBy, status)
  - Compound index on (assignedTo, status)
  - Text index on (title, description)
- **Validation**:
  - Required field validation
  - Enum value validation
  - Date validation (future dates)
  - Reference validation
  - Array validation for checklist
- **Middleware**:
  - Pre-save hook for update history tracking
  - Automatic timestamp management

#### Chat Model (`models/Chat.js`)
- **Schema Fields**:
  - `name`: String (required, trimmed)
  - `type`: String (enum: ["public", "team", "private", "ai_assistant"], default: "private")
  - `participants`: [ObjectId] (ref: User)
  - `admins`: [ObjectId] (ref: User)
  - `lastMessage`: ObjectId (ref: Message, default: null)
  - `aiAssistant`: {
      enabled: Boolean (default: false),
      model: String (enum: ["gpt-3.5-turbo", "gpt-4", "claude-3-sonnet", "claude-3-opus"], default: "gpt-3.5-turbo"),
      systemPrompt: String (default: "You are a helpful assistant in a bug tracking application.")
    }
  - `createdAt`: Date (auto-generated timestamp)
  - `updatedAt`: Date (auto-generated timestamp)
- **Features**:
  - Multiple chat types (public, team, private, AI assistant)
  - AI assistant integration with configurable models
  - Admin management
  - Participant tracking
  - Last message reference
- **Indexes**:
  - Index on participants
  - Index on type
  - Index on admins
- **Timestamps**:
  - Automatically tracks creation and update times

#### Message Model (`models/Message.js`)
- **Schema Fields**:
  - `chat`: ObjectId (ref: Chat, required)
  - `sender`: ObjectId (ref: User)
  - `content`: String (required)
  - `attachments`: [{
      filename: String,
      path: String,
      mimetype: String
    }]
  - `mentions`: [ObjectId] (ref: User)
  - `reactions`: [{
      user: ObjectId (ref: User),
      emoji: String
    }]
  - `isDeleted`: Boolean (default: false)
  - `isAIMessage`: Boolean (default: false)
  - `replyTo`: ObjectId (ref: Message, default: null)
  - `readBy`: [{
      user: ObjectId (ref: User),
      readAt: Date (default: now)
    }]
  - `createdAt`: Date (auto-generated timestamp)
  - `updatedAt`: Date (auto-generated timestamp)
- **Features**:
  - Rich message content with attachments
  - User mentions
  - Message reactions
  - Reply threading
  - Read receipts
  - AI message flagging
  - Soft deletion
- **Indexes**:
  - Compound index on (chat, createdAt)
  - Index on sender
  - Index on mentions
  - Index on isDeleted
- **Timestamps**:
  - Automatically tracks creation and update times

### 3. Controllers

#### Auth Controller (`controllers/authController.js`)
- **Endpoints**:
  ```javascript
  POST /api/auth/register    // User registration
  POST /api/auth/login       // User authentication
  GET  /api/auth/profile     // Get user profile
  PUT  /api/auth/profile     // Update profile
  ```
- **Features**:
  - JWT token generation with expiration
  - Password hashing with bcryptjs
  - Role-based access control
  - Input validation
  - Error handling with specific messages
- **Security**:
  - Password hashing
  - Token verification
  - Role validation
  - Input sanitization

#### Bug Controller (`controllers/bugController.js`)
- **Endpoints**:
  ```javascript
  POST   /api/bugs          // Create bug
  GET    /api/bugs          // List bugs (with filters)
  GET    /api/bugs/:id      // Get bug details
  PUT    /api/bugs/:id      // Update bug
  DELETE /api/bugs/:id      // Delete bug
  PUT    /api/bugs/:id/status    // Update status
  PUT    /api/bugs/:id/checklist // Update checklist
  GET    /api/bugs/dashboard/admin  // Admin dashboard
  GET    /api/bugs/dashboard/user   // User dashboard
  ```
- **Features**:
  - CRUD operations with role-based access
  - File attachment handling
  - Status management with validation
  - Assignment handling
  - Search and filtering
  - Pagination
  - Update history tracking
  - Dashboard data aggregation
- **Role-based Access**:
  - Admin: Full access
  - Tester: Create and view own bugs
  - Developer: View and update assigned bugs
- **Validation**:
  - Required fields
  - Enum values
  - Date formats
  - Reference existence
- **Error Handling**:
  - Specific error messages
  - Validation errors
  - Authorization errors
  - Database errors

#### Chat Controller (`controllers/chatController.js`)
- **Endpoints**:
  ```javascript
  POST   /api/chats              // Create chat
  GET    /api/chats              // List chats
  GET    /api/chats/:id          // Get chat
  POST   /api/chats/:id/messages // Send message
  GET    /api/chats/:id/messages // Get messages
  ```
- **Features**:
  - Real-time messaging
  - File sharing
  - Read receipts
  - Chat history
  - Participant management
- **WebSocket Events**:
  - Message delivery
  - Typing indicators
  - Online status
  - Read receipts

#### Report Controller (`controllers/reportController.js`)
- **Endpoints**:
  ```javascript
  GET /api/reports/bugs        // Bug statistics
  GET /api/reports/users       // User activity
  GET /api/reports/performance // System metrics
  ```
- **Features**:
  - Data aggregation
  - Custom date ranges
  - Excel export
  - Role-based access
- **Report Types**:
  - Bug statistics
  - User activity
  - Performance metrics
  - Custom reports

### 4. Middleware

#### Authentication Middleware (`middlewares/auth.js`)
- **verifyToken**:
  ```javascript
  // JWT token verification
  const verifyToken = async (req, res, next) => {
    // Token extraction and verification
    // User population
    // Error handling
  };
  ```
- **authorize**:
  ```javascript
  // Role-based authorization
  const authorize = (...roles) => {
    // Role validation
    // Access control
    // Error handling
  };
  ```
- **Features**:
  - Token verification
  - Role-based access control
  - Request validation
  - Error handling
- **Security**:
  - JWT verification
  - Role validation
  - Error messages
  - User context

#### Upload Middleware (`middlewares/upload.js`)
- **Features**:
  - File type validation
  - Size limits
  - Secure storage
  - Error handling
- **Configuration**:
  - Allowed file types
  - Size limits
  - Storage path
  - File naming

### 5. Services

#### File Service
- File upload handling
- Storage management
- File type validation
- Cleanup routines
- Security checks

#### Notification Service
- Email notifications
- In-app alerts
- WebSocket events
- Notification preferences

## API Endpoints

### Authentication Routes
```
POST /api/auth/register    # Register new user
POST /api/auth/login       # User login
GET  /api/auth/profile     # Get user profile
PUT  /api/auth/profile     # Update profile
```

### Bug Routes
```
POST   /api/bugs          # Create bug
GET    /api/bugs          # List bugs
GET    /api/bugs/:id      # Get bug
PUT    /api/bugs/:id      # Update bug
DELETE /api/bugs/:id      # Delete bug
```

### Chat Routes
```
POST   /api/chats              # Create chat
GET    /api/chats              # List chats
GET    /api/chats/:id          # Get chat
POST   /api/chats/:id/messages # Send message
GET    /api/chats/:id/messages # Get messages
```

### Report Routes
```
GET /api/reports/bugs        # Bug statistics
GET /api/reports/users       # User activity
GET /api/reports/performance # System metrics
```

## Security Implementation

### Authentication
- JWT-based authentication
  - Token generation
  - Token verification
  - Token refresh
  - Expiration handling
- Password security
  - Bcrypt hashing
  - Salt generation
  - Password validation
- Role-based access
  - Role verification
  - Permission checking
  - Access control

### Data Protection
- Input sanitization
  - XSS prevention
  - SQL injection prevention
  - Data validation
- CSRF protection
  - Token validation
  - Origin checking
- Rate limiting
  - Request counting
  - IP-based limiting
  - Role-based limits
- File upload security
  - Type validation
  - Size limits
  - Malware scanning
  - Secure storage

### Error Handling
- Global error middleware
  - Error logging
  - Error formatting
  - Stack trace handling
- Custom error classes
  - Validation errors
  - Authentication errors
  - Authorization errors
  - Database errors
- Validation error handling
  - Field validation
  - Type checking
  - Format validation
- Database error handling
  - Connection errors
  - Query errors
  - Validation errors

## Database Operations

### Indexing Strategy
- Compound indexes
  - User-role combinations
  - Status-based queries
  - Date-based queries
- Text indexes
  - Search optimization
  - Full-text search
- Unique indexes
  - Email uniqueness
  - Username uniqueness
- Performance indexes
  - Frequently queried fields
  - Sort operations
  - Join operations

### Query Optimization
- Pagination
  - Limit/offset
  - Cursor-based
  - Page-based
- Field projection
  - Selective fields
  - Nested fields
  - Virtual fields
- Aggregation pipeline
  - Pipeline optimization
  - Stage ordering
  - Memory usage
- Caching strategy
  - Query caching
  - Result caching
  - Cache invalidation

## Real-time Features

### WebSocket Implementation
- Socket.IO integration
  - Connection management
  - Room handling
  - Event handling
- Event-based communication
  - Message events
  - Status events
  - Notification events
- Room management
  - Private rooms
  - Group rooms
  - Dynamic rooms
- Connection handling
  - Authentication
  - Reconnection
  - Error handling

### Chat System
- Real-time messaging
  - Message delivery
  - Typing indicators
  - Read receipts
- File sharing
  - File upload
  - Progress tracking
  - Download handling
- User presence
  - Online status
  - Last seen
  - Activity tracking
- Message management
  - History
  - Search
  - Deletion

## File Management

### Upload System
- Secure file storage
  - Path validation
  - Permission checking
  - Secure naming
- Type validation
  - MIME checking
  - Extension validation
  - Content verification
- Size limits
  - File size
  - Total size
  - User quotas
- Cleanup routines
  - Temporary files
  - Unused files
  - Orphaned files

### File Types
- Images
  - JPEG, PNG, GIF
  - Size limits
  - Dimension checks
- Documents
  - PDF, DOC, DOCX
  - Size limits
  - Format validation
- Code files
  - Size limits
  - Language detection
  - Syntax checking
- Log files
  - Size limits
  - Format validation
  - Rotation policy

## Performance Optimizations

### Database
- Index optimization
  - Index selection
  - Index maintenance
  - Index usage
- Query caching
  - Result caching
  - Query planning
  - Cache invalidation
- Connection pooling
  - Pool size
  - Connection reuse
  - Timeout handling
- Aggregation optimization
  - Pipeline stages
  - Memory usage
  - Result size

### API
- Response compression
  - Gzip compression
  - Deflate compression
  - Compression levels
- Request validation
  - Input validation
  - Type checking
  - Format validation
- Rate limiting
  - Request counting
  - IP-based limits
  - Role-based limits
- Caching headers
  - Cache control
  - ETags
  - Last modified

## Error Handling

### Global Error Handler
- Custom error classes
  - Error types
  - Error codes
  - Error messages
- Error logging
  - Log levels
  - Log format
  - Log storage
- Client-friendly messages
  - Message formatting
  - Localization
  - Context inclusion
- Stack trace management
  - Development mode
  - Production mode
  - Error tracking

### Validation
- Input validation
  - Field validation
  - Type checking
  - Format validation
- Schema validation
  - Model validation
  - Document validation
  - Reference validation
- Custom validators
  - Business rules
  - Complex validation
  - Cross-field validation
- Error messages
  - Message format
  - Localization
  - Context inclusion

## Testing Strategy

### Unit Testing
- Controller tests
  - Endpoint testing
  - Response testing
  - Error testing
- Service tests
  - Function testing
  - Integration testing
  - Mock testing
- Model tests
  - Schema testing
  - Validation testing
  - Method testing
- Utility tests
  - Helper testing
  - Format testing
  - Conversion testing

### Integration Testing
- API endpoint tests
  - Route testing
  - Authentication testing
  - Authorization testing
- Database integration
  - Connection testing
  - Query testing
  - Transaction testing
- Authentication flow
  - Login testing
  - Registration testing
  - Token testing
- File operations
  - Upload testing
  - Download testing
  - Storage testing

## Deployment

### Environment Setup
- Environment variables
  - Configuration
  - Secrets
  - Feature flags
- Database configuration
  - Connection settings
  - Authentication
  - Replication
- File storage setup
  - Storage path
  - Permissions
  - Backup
- SSL/TLS configuration
  - Certificate setup
  - Key management
  - Protocol settings

### Production Considerations
- Logging
  - Log levels
  - Log format
  - Log storage
- Monitoring
  - Performance monitoring
  - Error tracking
  - Usage analytics
- Backup strategy
  - Database backup
  - File backup
  - Configuration backup
- Scaling options
  - Horizontal scaling
  - Vertical scaling
  - Load balancing

## Maintenance

### Code Organization
- Modular architecture
  - Module separation
  - Dependency management
  - Interface definition
- Clear separation of concerns
  - Layer separation
  - Responsibility division
  - Interface boundaries
- Consistent naming conventions
  - File naming
  - Function naming
  - Variable naming
- Documentation
  - Code comments
  - API documentation
  - Architecture documentation

### Version Control
- Git workflow
  - Branch strategy
  - Commit conventions
  - Merge process
- Branch management
  - Feature branches
  - Release branches
  - Hotfix branches
- Release process
  - Versioning
  - Changelog
  - Deployment
- Change logging
  - Change tracking
  - Impact analysis
  - Rollback planning

## Future Improvements
1. Implement:
   - Advanced search functionality
   - Analytics dashboard
   - Automated testing
   - CI/CD pipeline
   - Containerization
   - API documentation
   - Performance monitoring
   - Enhanced security features
