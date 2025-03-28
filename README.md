# Chat/Voice Widget for Retell AI

This repository contains a chat/voice widget feature that can be embedded in websites, allowing users to interact with Retell AI agents through both text chat and voice conversations.

## Features

- Embeddable chat widget for websites
- Text chat with AI agents
- Seamless transition to voice calls
- Real-time messaging with WebSocket
- Customizable appearance and behavior
- Secure cross-origin communication

## Prerequisites

- Docker and Docker Compose
- Node.js 20+ (for local development)
- Retell AI account with API key

## Quick Start

1. Clone this repository
2. Update the environment variables in `docker-compose.yml`
3. Run the application with Docker Compose:

```bash
docker-compose up
```

4. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## Environment Variables

### Backend

- `NODE_ENV`: Environment (development, production)
- `PORT`: Server port (default: 5000)
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret key for JWT authentication
- `RETELL_API_KEY`: Your Retell AI API key

### Frontend

- `REACT_APP_API_URL`: Backend API URL
- `REACT_APP_WS_URL`: WebSocket server URL

## Project Structure

```
.
├── backend/                 # Node.js backend
│   ├── controllers/         # API controllers
│   ├── middleware/          # Express middleware
│   ├── models/              # Database models
│   ├── routes/              # API routes
│   ├── services/            # Business logic
│   ├── config/              # Configuration files
│   ├── migrations/          # Database migrations
│   └── server.js            # Entry point
├── frontend/                # React frontend
│   ├── public/              # Static files
│   │   ├── widget.js        # Embedding script
│   │   ├── widget-frame.html # Widget iframe
│   │   └── widget-frame.js  # Widget iframe script
│   └── src/                 # React source code
│       ├── components/      # React components
│       │   └── ChatWidget/  # Chat widget components
│       ├── hooks/           # Custom React hooks
│       └── services/        # API services
├── database/                # Database scripts
│   └── postgresql_schema.sql # Database schema
└── docker-compose.yml       # Docker Compose configuration
```

## Embedding the Widget

To embed the chat widget in your website, add the following script tag to your HTML:

```html
<script src="https://your-api-domain.com/embed/widget.js?id=YOUR_WIDGET_ID" async></script>
```

Replace `YOUR_WIDGET_ID` with the ID of your widget configuration.

## Advanced Configuration

You can customize the widget by setting configuration options before loading the script:

```html
<script>
  window.rtlChatWidget = {
    widgetId: 'YOUR_WIDGET_ID',
    config: {
      position: 'bottom-right',
      themeColor: '#0088FF',
      headerText: 'Chat with us',
      welcomeMessage: 'Hello! How can I help you today?',
      autoOpen: false
    }
  };
</script>
<script src="https://your-api-domain.com/embed/widget.js" async></script>
```

## Development

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm start
```

## Documentation

For detailed documentation, see [documentation.md](./documentation.md).

## License

This project is licensed under the MIT License - see the LICENSE file for details.
