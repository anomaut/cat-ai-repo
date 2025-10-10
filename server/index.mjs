// imports
import {json} from 'express';
import morgan from 'morgan';
import express from 'express';
import cors from 'cors';
import routes from './src/routes.mjs'
import passport from 'passport';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// init express
const app = new express();
const port = process.env.PORT || 3001;
const isProduction = process.env.NODE_ENV === 'production';

//Middleware
app.use(json());
app.use(morgan('dev'));

// CORS configuration - allow both local development and production
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3001',
  process.env.CLIENT_URL || ''
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else if (isProduction) {
      // In production, allow same origin
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  optionsSuccessStatus: 200,
  credentials: true,
};
app.use(cors(corsOptions));

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.use(session({
  secret: process.env.SESSION_SECRET || "shhhhh... it's a secret!",
  resave: false,
  saveUninitialized: false,
}));

app.use(passport.authenticate('session'));

app.use("/api",routes);

// Serve static files from the React app in production
if (isProduction) {
  const clientBuildPath = path.join(__dirname, '..', 'client', 'dist');
  app.use(express.static(clientBuildPath));
  
  // Handle React routing, return all requests to React app
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
}

// activate the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
  console.log(`Environment: ${isProduction ? 'production' : 'development'}`);
});

export{app}