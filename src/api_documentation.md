# Retell AI API Documentation

## Overview
Retell AI is a comprehensive platform for building, testing, deploying, and monitoring reliable AI phone agents. This document provides details on how to integrate with Retell AI's API to create AI voice agents.

## Authentication
All API requests require authentication using an API key. You can obtain your API key from the "API Keys" tab in your Retell AI dashboard.

### API Key Usage
The API key should be included in the request headers or as part of the client initialization:

```javascript
// JavaScript
const client = new Retell({
  apiKey: "YOUR_RETELL_API_KEY",
});
```

```python
# Python
client = Retell(
  api_key="YOUR_RETELL_API_KEY"
)
```

## SDKs
Retell provides official SDKs to simplify integration:

### Node.js TypeScript SDK
- NPM Package: `retell-sdk`
- Requires Node.js version 18.10.0 or higher
- Installation: `npm install retell-sdk`

### Python SDK
- PyPI Package: `retell`
- Requires Python 3.x
- Installation: `pip install retell`

## Key Endpoints

### 1. Create Agent
Creates a new AI voice agent.

**Endpoint:** `POST /create-agent`

**Request Parameters:**
```json
{
  "response_engine": {
    "llm_id": "llm_234sdertfsdfsdf",
    "type": "retell-llm"
  },
  "voice_id": "11labs-Adrian"
}
```

**Response:**
```json
{
  "agent_id": "oBeDLoL0euAbiuaMFXRtDDLriTJ5tSxD",
  "response_engine": {
    "type": "retell-llm",
    "llm_id": "llm_234sdertfsdfsdf"
  }
}
```

### 2. Create Retell LLM
Creates a new Retell LLM Response Engine that can be attached to an agent.

**Endpoint:** `POST /create-retell-llm`

**Request Parameters:**
```json
{
  "model": "gpt-4o",
  "s2s_model": "gpt-4o-realtime",
  "model_temperature": 0,
  "model_high_priority": true,
  "tool_call_strict_mode": true,
  "general_prompt": "You are ...",
  "general_tools": [
    {
      "type": "api_call"
    }
  ]
}
```

**Response:**
```json
{
  "llm_id": "oBeDLoL0euAbiuaMFXRtDDLriTJ5tSxD",
  "model": "gpt-4o",
  "s2s_model": "gpt-4o-realtime"
}
```

### 3. Create Phone Call
Creates a new outbound phone call.

**Endpoint:** `POST /v2/create-phone-call`

**Request Parameters:**
```json
{
  "from_number": "+14157774444",
  "to_number": "+12137774445"
}
```

**Response:**
```json
{
  "call_type": "phone_call",
  "from_number": "+12137771234",
  "to_number": "+12137771235",
  "direction": "inbound",
  "telephony_identifier": {
    "twilio_call_sid": "CA5d0d0d80470f685c3f0ff908fe62c123"
  },
  "call_id": "JahrOTXYYJHfvl6Syvpi88rdAHYHmcq6"
}
```

## Error Handling
The API returns standard HTTP status codes:

- 200/201: Success
- 400: Bad Request
- 401: Unauthorized (invalid API key)
- 402: Payment Required
- 422: Unprocessable Entity
- 429: Rate Limit Exceeded
- 500: Server Error

## Best Practices
1. Always wrap SDK calls in try-catch blocks
2. Take advantage of TypeScript types in the Node.js SDK
3. Refer to the API documentation for all available parameters
4. Use the SDKs instead of direct REST API calls when possible for better type safety and simpler code

## Additional Resources
- Node.js SDK Examples: Available in the SDK repository
- Python SDK Examples: Available in the SDK repository
