# Fincentest

A financing platform that allows users to calculate payment plans for products from various e-commerce sites based on company-specific interest rates and terms.

## Features

- Company-specific authentication
- Product information scraping from Amazon and MercadoLibre
- Dynamic payment calculations based on company terms
- Modern, responsive UI
- Secure password verification

## Tech Stack

- Frontend:
  - React
  - Vite
  - TailwindCSS
  - Axios

- Backend:
  - Node.js
  - Express
  - Supabase
  - Web scraping utilities

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Supabase account and project

## Setup

1. Clone the repository:
```bash
git clone https://github.com/diegoagarza98/fincentest.git
cd fincentest
```

2. Install dependencies:
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
```

3. Configure environment variables:
   - Create a `.env` file in the backend directory
   - Add your Supabase credentials and other configuration:
```env
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Set up the Supabase database:
   - Create a `companies` table with the following schema:
```sql
create table companies (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  password text not null,
  interest_rate decimal not null,
  max_months integer not null
);
```

5. Start the development servers:
```bash
# Start backend server (from backend directory)
npm start

# Start frontend development server (from root directory)
npm run dev
```

## Usage

1. Access the application at `http://localhost:5173`
2. Select a company and enter the password
3. Enter a product URL from Amazon or MercadoLibre
4. View and select from available financing options

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Recent Updates

### Port Management Enhancement
- Added automatic port selection feature
- Server now automatically finds an available port if the default port (3001) is in use
- Improves development experience by preventing port conflicts

## Development

### Backend
The backend server will automatically:
1. Try to use the default port (3001)
2. If port 3001 is in use, it will automatically increment and try the next available port
3. Logs the actual port being used when the server starts

### Environment Variables
- `PORT`: (Optional) Default port for the server (defaults to 3001)
- `NODE_ENV`: Environment setting ('development' or 'production')
- `CORS_ORIGIN`: Allowed origins for CORS

## Getting Started

1. Clone the repository
```bash
git clone https://github.com/tresgarza/fincentiva-feb21-2025.git
cd fincentiva-feb21-2025
```

2. Install dependencies
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
```

3. Start the development servers
```bash
# Start backend (will automatically find available port)
cd backend
npm run dev

# Start frontend (in a new terminal)
cd ..
npm run dev
```

## Features
- Automatic port management for development
- Real-time product scraping
- Financing calculations
- Company authentication
- Responsive design
