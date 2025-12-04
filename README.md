# 🎵 YouTube Music Stats

A comprehensive web application that analyzes your YouTube Music listening history to provide detailed insights into your music consumption patterns, favorite artists, top songs, and listening behaviors over time. Features a beautiful "Wrapped" experience similar to Spotify Wrapped!

## ✨ Features

- **📊 Comprehensive Analytics**: Get detailed statistics about your listening habits
- **🎨 Interactive Dashboard**: Beautiful, responsive dashboard with charts and visualizations
- **🔝 Top Artists & Songs**: Discover your most played artists and tracks
- **📈 Listening Patterns**: Analyze your music consumption over time
- **🎵 Song Duration Analysis**: Get insights into your preferred song lengths
- **📅 Historical Data**: Track your music journey with historical listening data
- **🎁 Wrapped Experience**: Spotify-style animated year-in-review with shareable slides
- **🎼 Music Era Analysis**: Discover what decade your music taste belongs to
- **🌙 Dark/Light Mode**: Seamless theme switching
- **📱 Mobile Responsive**: Optimized for all devices
- **🔐 Secure Authentication**: Email/password and Google OAuth integration
- **☁️ Cloud Storage**: Secure data storage with MongoDB
- **📂 File Upload**: Easy Google Takeout data import

## 🛠️ Tech Stack

### Frontend

- **Next.js 16**: React 19 framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS v4**: Utility-first CSS framework
- **Shadcn UI**: Beautiful UI components
- **Motion (Framer Motion)**: Smooth animations and transitions
- **Recharts**: Interactive charts and visualizations
- **React Three Fiber**: 3D graphics and visual effects

### Backend

- **MongoDB**: NoSQL database
- **Mongoose**: MongoDB object modeling
- **Better Auth**: Modern authentication system

### Development

- **Biome**: Fast linting and formatting
- **pnpm**: Package manager
- **Turbopack**: Lightning-fast bundler

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- MongoDB instance (local or cloud)
- Google OAuth credentials (optional)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/DestroyerV/ytmusic-stats.git
   cd ytmusic-stats
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the root directory:

   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/ytmusic-stats
   
   # Authentication
   BETTER_AUTH_SECRET=your-secret-key-here
   BETTER_AUTH_URL=http://localhost:3000
   
   # Google OAuth (optional)
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   ```

4. **Start the development server**

   ```bash
   pnpm dev
   ```

5. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

## 📖 How to Use

### 1. Get Your Google Takeout Data

1. Go to [Google Takeout](https://takeout.google.com)
2. Select **YouTube and YouTube Music**
3. Choose **JSON** format
4. Download your data archive
5. Extract the `watch-history.json` file from the YouTube folder

### 2. Upload Your Data

1. Sign up or sign in to the application
2. Navigate to the Upload page
3. Upload your `watch-history.json` file
4. Wait for processing to complete (this may take a few minutes)

### 3. Explore Your Stats

Once processing is complete, explore your personalized dashboard featuring:

- **Overview Stats**: Total songs, artists, playtime, and more
- **Top Artists**: Your most listened-to artists with play counts
- **Top Songs**: Your favorite tracks ranked by play frequency  
- **Listening Patterns**: Charts showing your music consumption over time
- **Music Era**: Discover what decade defines your music taste
- **Wrapped Experience**: An animated journey through your listening year

## 🎁 Wrapped Experience

The Wrapped feature provides a Spotify-style animated slideshow of your music year:

- **Intro Slide**: Welcome and overview of your journey
- **Listening Time**: Total hours spent listening to music
- **Top Artist**: Your most played artist with stats
- **Top Song**: Your most played track
- **Music Era**: What decade your music taste belongs to
- **Fun Facts**: Interesting insights about your listening habits
- **Summary**: Shareable summary of your music year

Navigate using arrow keys, click, or let it autoplay!

## 🏗️ Project Structure

```
├── app/                      # Next.js App Router pages
│   ├── api/                  # API routes
│   ├── auth/                 # Authentication pages (signin, signup)
│   ├── dashboard/            # Dashboard with stats components
│   ├── upload/               # File upload functionality
│   ├── wrapped/              # Spotify-style Wrapped experience
│   └── layout.tsx            # Root layout
├── components/               # React components
│   ├── ui/                   # Shadcn UI components
│   └── ...                   # App components (Navigation, etc.)
├── lib/                      # Utility libraries
│   ├── auth/                 # Better Auth configuration
│   ├── client/               # Client-side utilities (parser, stats)
│   ├── db/                   # Database models and connection
│   ├── services/             # Business logic services
│   └── types/                # TypeScript type definitions
├── hooks/                    # Custom React hooks
└── public/                   # Static assets
```

## 🗄️ Database Schema

The application uses MongoDB with the following main collections:

- **Users**: User account information (managed by Better Auth)
- **Songs**: Song metadata (title, artist, duration, thumbnail, release date)
- **UserStats**: Aggregated user statistics including:
  - Total songs, artists, and playtime
  - Top songs and artists with play counts
  - Music era analysis and decade distribution
  - Daily averages and longest listening sessions

## 🔧 Configuration

### Authentication

The app supports multiple authentication methods:

- Email/password registration
- Google OAuth integration

Configure these in `lib/auth/config.ts` and your environment variables.

### File Processing

Google Takeout files are processed client-side with:

- Intelligent song title parsing
- Artist extraction from video metadata
- Duplicate detection and handling

## 📊 Analytics Features

### Statistics Tracked

- Total unique songs played
- Total unique artists
- Total playtime (hours/minutes)
- Average song length
- Most played artist and song
- First and last play dates
- Daily listening averages
- Longest listening sessions
- Music era and decade distribution
- Oldest and newest songs in library

### Visualizations

- Play count trends over time
- Top artists bar charts
- Top songs rankings
- Decade distribution charts
- Music era insights

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set up environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment

1. Build the application:

   ```bash
   pnpm build
   ```

2. Start the production server:

   ```bash
   pnpm start
   ```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style
- Write TypeScript for type safety
- Add tests for new features
- Update documentation as needed
- Use Biome for linting and formatting

## 🐛 Troubleshooting

### Common Issues

**File Upload Fails**

- Ensure the file is a valid JSON from Google Takeout
- Check that you're uploading the correct `watch-history.json` file

**Authentication Issues**

- Verify MongoDB connection string
- Check Better Auth configuration
- Ensure environment variables are set correctly

**Stats Not Loading**

- Make sure you've uploaded your data first
- Check browser console for errors
- Verify API routes are working

### Getting Help

- Check the [Issues](https://github.com/DestroyerV/ytmusic-stats/issues) page
- Create a new issue with detailed information
- Include error messages and steps to reproduce

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Made with ❤️ by [Vaibhav Mishra](https://github.com/DestroyerV)**
