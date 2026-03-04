# API Endpoint Tests

## Test Create Poll

### Test 1: Valid Poll Creation

```bash
curl -X POST http://localhost:8000/api/polls \
  -H "Content-Type: application/json" \
  -d '{
    "question": "Where should we get food?",
    "options": ["Pizza", "Sushi", "Burgers", "Tacos"]
  }'
```

Expected Response (201):

```json
{
  "id": "clhx1234abcd5678efgh",
  "voteId": "xyz123abc",
  "resultsId": "results789xyz",
  "votingUrl": "/poll/xyz123abc",
  "resultsUrl": "/results/results789xyz"
}
```

### Test 2: Invalid - Missing Question

```bash
curl -X POST http://localhost:8000/api/polls \
  -H "Content-Type: application/json" \
  -d '{
    "options": ["Pizza", "Sushi"]
  }'
```

Expected Response (400):

```json
{
  "error": "Question is required and must be a string"
}
```

### Test 3: Invalid - Only One Option

```bash
curl -X POST http://localhost:8000/api/polls \
  -H "Content-Type: application/json" \
  -d '{
    "question": "What is your favorite food?",
    "options": ["Pizza"]
  }'
```

Expected Response (400):

```json
{
  "error": "At least 2 options are required"
}
```

### Test 4: Invalid - Too Many Options

```bash
curl -X POST http://localhost:8000/api/polls \
  -H "Content-Type: application/json" \
  -d '{
    "question": "Pick a number",
    "options": ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"]
  }'
```

Expected Response (400):

```json
{
  "error": "Maximum 10 options allowed"
}
```

### Test 5: Invalid - Duplicate Options

```bash
curl -X POST http://localhost:8000/api/polls \
  -H "Content-Type: application/json" \
  -d '{
    "question": "Pick a food",
    "options": ["Pizza", "pizza", "Sushi"]
  }'
```

Expected Response (400):

```json
{
  "error": "Duplicate options are not allowed"
}
```

---

## Test Get Poll by VoteId

### Test 1: Valid VoteId

First create a poll, then use the voteId:

```bash
# Replace xyz123abc with actual voteId from created poll
curl http://localhost:8000/api/poll/xyz123abc
```

Expected Response (200):

```json
{
  "id": "clhx1234abcd5678efgh",
  "question": "Where should we get food?",
  "options": [
    { "id": "opt1abc", "text": "Pizza", "voteCount": 0 },
    { "id": "opt2def", "text": "Sushi", "voteCount": 0 },
    { "id": "opt3ghi", "text": "Burgers", "voteCount": 0 },
    { "id": "opt4jkl", "text": "Tacos", "voteCount": 0 }
  ]
}
```

### Test 2: Invalid VoteId

```bash
curl http://localhost:8000/api/poll/invalidid123
```

Expected Response (404):

```json
{
  "error": "Poll not found"
}
```

---

## Quick Test Script

Save this as `test-api.sh` and run with `bash test-api.sh`:

```bash
#!/bin/bash

echo "Testing Campus Poll API"
echo "======================="

echo -e "\n1. Creating a poll..."
RESPONSE=$(curl -s -X POST http://localhost:8000/api/polls \
  -H "Content-Type: application/json" \
  -d '{
    "question": "What is your favorite programming language?",
    "options": ["JavaScript", "Python", "Java", "Go"]
  }')

echo "$RESPONSE" | jq '.'

# Extract voteId
VOTE_ID=$(echo "$RESPONSE" | jq -r '.voteId')

echo -e "\n2. Fetching poll with voteId: $VOTE_ID"
curl -s http://localhost:8000/api/poll/$VOTE_ID | jq '.'

echo -e "\n3. Testing error - invalid voteId"
curl -s http://localhost:8000/api/poll/invalid123 | jq '.'

echo -e "\n4. Testing error - missing question"
curl -s -X POST http://localhost:8000/api/polls \
  -H "Content-Type: application/json" \
  -d '{"options": ["A", "B"]}' | jq '.'

echo -e "\nTests completed!"
```
