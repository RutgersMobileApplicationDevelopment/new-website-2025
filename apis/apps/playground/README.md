# RUMAD API Playground

Interactive playground for testing RUMAD API endpoints.

## Features

- 🎯 **Request Builder**: Test any endpoint with custom parameters
- 📊 **Quota Visualization**: Real-time rate limit tracking
- 📈 **Metrics Display**: Cache status, latency, and more
- 📚 **Headers Guide**: Learn API best practices
- 📖 **API Documentation**: Integrated Swagger UI

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3002](http://localhost:3002)

## Pages

- `/` - Interactive request builder
- `/headers` - Educational guide on API headers
- `/docs` - Complete API documentation (Swagger UI)

## Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Build

```bash
npm run build
npm start
```

## Deploy

**Vercel:**
```bash
vercel deploy
```

**Environment Variables:**
- `NEXT_PUBLIC_API_URL`: Production API URL

## License

MIT
