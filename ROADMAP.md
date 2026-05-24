# CodeMentor AI Roadmap

This document is the step-by-step plan for turning the current project into a production-style SaaS app with authentication, PostgreSQL persistence, chat history, advanced RAG, image debugging, and deployment.

## Target Stack

- Frontend: React + Vite + Tailwind CSS
- Backend: FastAPI
- Database: Supabase PostgreSQL
- Authentication: Supabase Auth with Google OAuth
- Storage: Supabase Storage for uploads and screenshots
- Vector store: ChromaDB for local/dev RAG, with a migration path to production-friendly embeddings storage if needed later
- Frontend deployment: Vercel
- Backend deployment: Render

## Product Direction

The app should feel like a real SaaS product, not a single-shot chatbot. The core experience will be:

- Login and signup with Google OAuth
- Save and revisit chats
- Persist reviews, fixes, uploads, and project history
- Analyze code, screenshots, and debugging traces
- Use multi-agent workflows for language detection, bug analysis, fix suggestion, validation, and explanation
- Show a clean dashboard with recent chats and saved projects

## Phase 1: Foundation

Goal: establish identity, persistence, and the app shell.

1. Set up Supabase project
   - Create a Supabase project
   - Enable Google OAuth provider
   - Create database tables
   - Configure Row Level Security policies
   - Create storage buckets for code uploads, screenshots, and attachments

2. Add authentication flow
   - Signup
   - Login
   - Logout
   - Google sign-in
   - Session refresh
   - Protected frontend routes
   - Backend JWT verification for requests

3. Add user account bootstrap
   - Create user profile row after first login
   - Store display name, email, avatar, auth provider, and preferences
   - Track onboarding status

4. Add deployment baseline
   - Frontend environment variables for Supabase and backend API URL
   - Backend environment variables for Supabase JWT verification, database URL, and Gemini API key
   - Prepare Render deployment config for FastAPI
   - Prepare Vercel deployment config for React

## Phase 2: Core SaaS Data Model

Goal: define the main entities that make the product persistent.

### Database Models

1. users
   - id
   - supabase_user_id
   - email
   - full_name
   - avatar_url
   - auth_provider
   - created_at
   - updated_at

2. projects
   - id
   - user_id
   - name
   - description
   - language
   - framework
   - status
   - created_at
   - updated_at

3. chats
   - id
   - user_id
   - project_id
   - title
   - summary
   - mode
   - created_at
   - updated_at

4. messages
   - id
   - chat_id
   - role
   - content
   - metadata
   - created_at

5. reviews
   - id
   - user_id
   - chat_id
   - project_id
   - language
   - score
   - result_json
   - created_at

6. fixes
   - id
   - user_id
   - chat_id
   - review_id
   - original_code
   - fixed_code
   - explanation
   - validation_json
   - created_at

7. uploads
   - id
   - user_id
   - chat_id
   - file_type
   - file_name
   - storage_path
   - mime_type
   - extracted_text
   - created_at

8. memories
   - id
   - user_id
   - key
   - value_json
   - created_at
   - updated_at

9. audit_logs
   - id
   - user_id
   - action
   - entity_type
   - entity_id
   - metadata
   - created_at

### Pydantic Schemas

Create request and response schemas for each main API object:

- Auth
  - LoginRequest
  - SignupRequest
  - SessionResponse
  - UserProfileResponse

- Projects
  - ProjectCreate
  - ProjectUpdate
  - ProjectResponse

- Chats
  - ChatCreate
  - ChatUpdate
  - ChatSummary
  - ChatDetail

- Messages
  - MessageCreate
  - MessageResponse

- Reviews
  - CodeReviewRequest
  - CodeReviewResponse
  - ReviewHistoryItem

- Fixes
  - FixSuggestionRequest
  - FixSuggestionResponse
  - FixValidationResponse

- Uploads
  - UploadCreate
  - UploadResponse
  - OCRResult

- Memory
  - MemoryUpsert
  - MemoryResponse

## Phase 3: Authentication and Protected Access

Goal: make the app usable only after login.

1. Frontend auth UI
   - Login page
   - Signup page
   - Google sign-in button
   - Loading and error states
   - Redirects after auth

2. Protected routes
   - Dashboard
   - Chat history
   - Review history
   - Project detail pages
   - Settings page

3. Backend auth guard
   - Verify Supabase JWT on every private route
   - Extract user id from token
   - Reject unauthorized requests with clear errors

4. User profile sync
   - Create profile on first login
   - Keep profile data aligned between frontend session and backend database

## Phase 4: Chat History and Saved Work

Goal: turn one-off interactions into persistent workspaces.

1. Save every chat
   - Store the conversation title
   - Store message history
   - Store linked project and language metadata

2. Sidebar history UI
   - Recent chats
   - Search by title or language
   - Open previous conversation
   - Continue from old context

3. Saved outputs
   - Save reviews
   - Save fixes
   - Save validation results
   - Save notes and summaries

4. Project workspace
   - Group chats by project
   - Reuse context across sessions

## Phase 5: Advanced AI Workflow

Goal: make the backend feel like a multi-agent debugging platform.

### Backend Agents

1. language_detection
   - Detect language and framework from uploaded code

2. bug_detection
   - Identify likely root cause
   - Classify the issue type

3. complexity_analysis
   - Estimate maintainability and complexity

4. fix_suggestion
   - Generate corrected code
   - Provide practical explanation

5. explanation
   - Generate beginner and expert explanations

6. validation
   - Check syntax
   - Compare fix to retrieved context
   - Flag hallucination risk

7. workflow
   - Orchestrate the full chain
   - Aggregate outputs into one response

### AI Response Shape

Return a structured response with:

- detected language
- detected framework
- issue summary
- root cause
- fix code
- explanation
- quality score
- validation result
- safety notes
- follow-up suggestions

## Phase 6: RAG Upgrade

Goal: make retrieval meaningful for real developer help.

### Knowledge Sources

- coding best practices
- language-specific rules
- framework docs
- design patterns
- system design notes
- security vulnerabilities
- debugging patterns
- interview prep docs
- LeetCode-style examples
- official documentation snippets

### Retrieval Strategy

- Filter by language
- Filter by framework
- Filter by issue type
- Filter by code pattern
- Filter by security context

### RAG Outputs

- Retrieved context snippets
- Why each snippet was selected
- Which agent used them
- Confidence level

## Phase 7: Image and Multimodal Debugging

Goal: let users upload screenshots and terminal images.

1. Upload image support
   - Error screenshots
   - Terminal screenshots
   - VS Code screenshots

2. OCR or vision extraction
   - Use Gemini Vision if available
   - Keep OCR fallback path for text extraction

3. Store extracted text
   - Save OCR output in uploads table
   - Attach extracted text to chat context

4. Analyze image plus code together
   - Combine screenshot text with uploaded code
   - Route into bug detection and fix generation

## Phase 8: Quality, Security, and Scores

Goal: make the output look professional and enterprise-ready.

1. AI code quality score
   - Readability
   - Naming
   - Security
   - Maintainability
   - Performance

2. Security review agent
   - SQL injection checks
   - Secret exposure checks
   - Unsafe auth flow checks
   - Insecure API usage checks

3. Validation agent
   - Syntax validation
   - RAG alignment
   - Fix quality checks

4. Optional test generator
   - Unit test suggestions
   - Edge cases
   - Integration ideas

## Phase 9: Frontend Product Experience

Goal: make the UI feel like a startup product.

1. App shell
   - Sidebar with recent chats and projects
   - Main work area for uploads and chat
   - Right panel for analysis results

2. Pages
   - Landing page
   - Login
   - Signup
   - Dashboard
   - Chat detail
   - Review history
   - Project detail
   - Settings

3. UX polish
   - Streaming responses
   - Progress indicators for workflow stages
   - Collapsible history
   - Empty states
   - Error states

4. Later UI upgrades
   - Agent workflow visualization
   - Observability dashboard
   - Learning mode toggle

## Phase 10: Deployment Plan

### Frontend on Vercel

- Build React app with production env vars
- Point API calls to Render backend URL
- Configure auth callback URLs for Supabase

### Backend on Render

- Deploy FastAPI service
- Use Render environment variables for Supabase and Gemini
- Add health endpoint
- Add CORS for Vercel domain

### Supabase

- Host PostgreSQL
- Host Auth
- Host Storage
- Enable Row Level Security

## Suggested Implementation Order

1. Supabase project + Google OAuth
2. Database schema + RLS policies
3. Backend auth verification
4. Frontend login/signup/protected routes
5. User profile sync
6. Chat history persistence
7. Review/fix/project models
8. RAG expansion
9. Image upload + OCR/vision
10. Quality score + security review
11. Deployment to Render and Vercel
12. Optional test generation, GitHub integration, observability

## Notes for the Current Codebase

- The backend already has chat, review, upload, validation, and RAG modules, so the first real change should be persistence and auth rather than rewriting the agent pipeline.
- The existing structure is a good fit for adding database-backed history and user-specific workspaces.
- Supabase is the right choice here because it gives PostgreSQL, auth, and storage in one platform.

## Success Criteria

- Users can sign in with Google
- Requests are tied to a user account
- Chats and reviews persist after refresh
- Previous work can be reopened
- Uploaded code and screenshots are stored safely
- The backend returns structured AI analysis with validation
- The app can be deployed on Vercel, Render, and Supabase without local-only dependencies
