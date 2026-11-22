# Contributing to CtrlX

Thanks for contributing to CtrlX.

CtrlX is a full-stack bug tracking and project collaboration application built with a React frontend and an Express/MongoDB backend. Contributions should keep the application secure, maintainable, and compatible across both parts of the project.

## Development Setup

Clone the repository:

```bash
git clone https://github.com/Rishy-09/CtrlX_Error.git
cd CtrlX_Error
```

### Frontend

Install frontend dependencies:

```bash
cd frontend
npm install
```

Start the development server:

```bash
npm run dev
```

### Backend

From the repository root:

```bash
cd backend
npm install
```

Create your local environment file using the repository's `.env.example` as a reference.

Do not commit the resulting `.env` file.

Start the backend:

```bash
npm run dev
```

## Environment Configuration

The application requires environment-specific configuration for services such as:

- MongoDB
- JWT authentication
- admin registration
- AI integration
- frontend/backend communication
- CORS

Refer to `.env.example` for the supported variables.

For CORS, `CLIENT_ORIGINS` accepts a comma-separated list of permitted frontend origins.

Example:

```env
CLIENT_ORIGINS=http://localhost:5173,http://localhost:3000
```

Never commit real API keys, database credentials, JWT secrets, or other sensitive values.

## Validation

Before submitting a change, verify that the frontend still builds successfully:

```bash
cd frontend
npm run build
```

Validate the backend JavaScript syntax from the repository root:

```bash
node --check backend/server.js

find backend/controllers backend/middlewares backend/models backend/routes backend/services \
  -type f -name "*.js" -print0 | xargs -0 -n1 node --check
```

GitHub Actions performs these checks automatically for pushes and pull requests targeting `main`.

## Frontend Changes

When modifying the frontend:

- preserve existing role-based workflows
- avoid committing generated `dist/` output
- keep API configuration environment-driven
- remove unused or duplicate components where appropriate
- verify the production build before committing

The repository currently contains some existing ESLint warnings and cleanup debt. Avoid introducing additional lint problems when making changes.

## Backend Changes

When modifying the backend:

- preserve authentication and authorization checks
- validate user-controlled input
- keep secrets in environment variables
- avoid exposing unrestricted upload endpoints
- maintain appropriate file-size and file-type restrictions
- keep CORS configuration environment-driven
- return appropriate HTTP status codes for failures

Changes to authentication, authorization, uploads, or CORS should receive additional review.

## File Uploads

Runtime uploads belong under:

```text
backend/uploads/
```

Uploaded files must not be committed to Git.

The repository keeps only the directory placeholder required for local setup.

## Dependencies

When updating dependencies:

1. Prefer non-breaking updates.
2. Review `npm audit` results.
3. Avoid `npm audit fix --force` unless the resulting breaking changes have been reviewed and tested.
4. Re-run the frontend production build and backend validation after dependency changes.

## Pull Requests

Keep pull requests focused on one logical change.

A useful pull request should explain:

- what changed
- why the change was needed
- which frontend/backend components are affected
- how the change was validated
- whether security or environment configuration is affected

Include screenshots when a change materially affects the UI.

## Security

Do not commit:

- `.env` files
- MongoDB credentials
- JWT secrets
- API keys
- admin invite tokens
- runtime uploads
- `node_modules/`
- frontend build output
- temporary or generated files

If you discover a security-sensitive problem, avoid publishing credentials or exploitable secrets in an issue or pull request.

## Code Quality

Prefer focused improvements over unrelated refactoring.

Before committing:

```bash
git status
```

Review the changed files and make sure generated files, local configuration, credentials, and runtime uploads are not included.

## Questions and Issues

Use GitHub Issues for reproducible bugs, feature proposals, documentation problems, and other project improvements.

When reporting a bug, include enough information to reproduce the problem, such as the affected role, page/API route, expected behaviour, and observed behaviour.