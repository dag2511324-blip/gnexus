# Backend API Testing Guide

Complete guide to testing all backend endpoints for G-Nexus Chat.

## Prerequisites

1. Backend server running: `npm run dev`
2. Database setup complete
3. Environment variables configured

## Test Workflow

### 1. Register a User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "dagmawi@gnexus.com",
    "password": "Secure123!",
    "username": "dagmawi",
    "firstName": "Dagmawi",
    "lastName": "Amare"
  }'
```

**Expected Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "usr_abc123",
    "email": "dagmawi@gnexus.com",
    "username": "dagmawi",
    "firstName": "Dagmawi",
    "lastName": "Amare",
    "createdAt": "2026-01-07T..."
  },
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

**Save the `accessToken` for subsequent requests!**

---

### 2. Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "dagmawi@gnexus.com",
    "password": "Secure123!"
  }'
```

---

### 3. Get Current User

```bash
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

### 4. Create Conversation

```bash
curl -X POST http://localhost:5000/api/conversations \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Marketing Strategy Discussion",
    "model": "planner"
  }'
```

**Expected Response:**
```json
{
  "id": "conv_123",
  "title": "Marketing Strategy Discussion",
  "model": "planner",
  "createdAt": "2026-01-07T..."
}
```

**Save the conversation `id`!**

---

### 5. Send Message (Non-Streaming)

```bash
curl -X POST http://localhost:5000/api/conversations/CONVERSATION_ID/messages \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Help me create a marketing plan for a new AI product"
  }'
```

**Expected Response:**
```json
{
  "userMessage": {
    "id": "msg_1",
    "role": "user",
    "content": "Help me create a marketing plan for a new AI product",
    "createdAt": "2026-01-07T..."
  },
  "assistantMessage": {
    "id": "msg_2",
    "role": "assistant",
    "content": "I'll help you create a comprehensive marketing plan...",
    "model": "planner",
    "tokens": 450,
    "latency": 1250,
    "createdAt": "2026-01-07T..."
  }
}
```

---

### 6. Send Message (Streaming)

```bash
curl -X POST http://localhost:5000/api/conversations/CONVERSATION_ID/messages/stream \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "What should my target audience be?"
  }'
```

**Expected Response (SSE Stream):**
```
data: {"type":"user_message","message":{...}}

data: {"type":"chunk","content":"Your"}

data: {"type":"chunk","content":" target"}

data: {"type":"chunk","content":" audience"}

...

data: {"type":"complete","message":{...}}

data: [DONE]
```

---

### 7. Get All Conversations

```bash
curl http://localhost:5000/api/conversations \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Query Parameters:**
- `page=1` - Page number
- `limit=20` - Items per page
- `archived=false` - Show archived
- `starred=true` - Filter starred
- `search=marketing` - Search by title

---

### 8. Get Single Conversation with Messages

```bash
curl http://localhost:5000/api/conversations/CONVERSATION_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

### 9. Update Conversation

```bash
curl -X PATCH http://localhost:5000/api/conversations/CONVERSATION_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Title",
    "isStarred": true,
    "tags": ["marketing", "ai"]
  }'
```

---

### 10. Delete Conversation

```bash
curl -X DELETE http://localhost:5000/api/conversations/CONVERSATION_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

### 11. Refresh Token

```bash
curl -X POST http://localhost:5000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

---

### 12. Logout

```bash
curl -X POST http://localhost:5000/api/auth/logout \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

---

## Testing with Postman

1. Import this collection: [Create manually or use Thunder Client in VS Code]
2. Set environment variables:
   - `BASE_URL`: `http://localhost:5000`
   - `ACCESS_TOKEN`: (from login response)
   - `CONVERSATION_ID`: (from create conversation response)

## Automated Testing Script

Save this as `test-api.sh`:

```bash
#!/bin/bash

BASE_URL="http://localhost:5000"

# 1. Register
echo "1. Registering user..."
REGISTER_RESPONSE=$(curl -s -X POST $BASE_URL/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@gnexus.com",
    "password": "Test123!",
    "username": "testuser"
  }')

echo $REGISTER_RESPONSE | jq '.'

# Extract access token
ACCESS_TOKEN=$(echo $REGISTER_RESPONSE | jq -r '.accessToken')
echo "Access Token: $ACCESS_TOKEN"

# 2. Create conversation
echo -e "\n2. Creating conversation..."
CONV_RESPONSE=$(curl -s -X POST $BASE_URL/api/conversations \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Conversation",
    "model": "planner"
  }')

echo $CONV_RESPONSE | jq '.'

CONV_ID=$(echo $CONV_RESPONSE | jq -r '.id')
echo "Conversation ID: $CONV_ID"

# 3. Send message
echo -e "\n3. Sending message..."
curl -s -X POST "$BASE_URL/api/conversations/$CONV_ID/messages" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Hello, how are you?"
  }' | jq '.'

# 4. Get conversations
echo -e "\n4. Getting all conversations..."
curl -s "$BASE_URL/api/conversations" \
  -H "Authorization: Bearer $ACCESS_TOKEN" | jq '.'

echo -e "\n✅ Testing complete!"
```

Run with: `bash test-api.sh`

## Expected Status Codes

| Endpoint | Success | Error |
|----------|---------|-------|
| Register | 201 Created | 409 Conflict (duplicate) |
| Login | 200 OK | 401 Unauthorized |
| Get Conversations | 200 OK | 401 Unauthorized |
| Create Conversation | 201 Created | 400 Bad Request |
| Send Message | 200 OK | 404 Not Found, 429 Rate Limit |
| Update Conversation | 200 OK | 404 Not Found |
| Delete Conversation | 200 OK | 404 Not Found |

## Error Responses

All errors follow this format:
```json
{
  "error": "Error Type",
  "message": "Detailed error message"
}
```

## Rate Limiting

- **Auth endpoints**: 5 requests/minute per IP
- **Chat endpoints**: 30 messages/minute per user
- **General API**: 30 requests/minute

When rate limited:
```json
{
  "error": "Too Many Requests",
  "message": "Too many requests from this IP, please try again later."
}
```

## Debugging Tips

1. **Check server logs** - Errors are logged to console
2. **Verify DATABASE_URL** - Check connection string is correct
3. **Check JWT_SECRET** - Must be set in .env
4. **Run Prisma Studio** - `npm run db:studio` to view database
5. **Check OPENROUTER_API_KEY** - Must be valid for AI responses

## Common Issues

**401 Unauthorized**
- Token expired (15min default)
- Invalid token
- Missing Authorization header

**404 Not Found**
- Conversationn ID doesn't exist
- User doesn't own the conversation

**429 Too Many Requests**
- Hit rate limit
- Wait 1 minute and try again

**500 Internal Server Error**
- Check server logs
- Database connection issue
- Missing environment variables
