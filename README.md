oyer# 🎵 YouTube Music Stats

A comprehensive web application that analyzes your YouTube Music listening history to provide detailed insights into your music consumption patterns, favorite artists, top songs, and listening behaviors over time.

## ✨ Features

- **📊 Comprehensive Analytics**: Get detailed statistics about your listening habits
- **🎨 Interactive Dashboard**: Beautiful, responsive dashboard with charts and visualizations
- **🔝 Top Artists & Songs**: Discover your most played artists and tracks
- **📈 Listening Patterns**: Analyze your music consumption over time
- **🎵 Song Duration Analysis**: Get insights into your preferred song lengths
- **📅 Historical Data**: Track your music journey with historical listening data
- **🌙 Dark/Light Mode**: Seamless theme switching
- **📱 Mobile Responsive**: Optimized for all devices
- **🔐 Secure Authentication**: Email/password and Google OAuth integration
- **☁️ Cloud Storage**: Secure data storage with MongoDB
- **📂 File Upload**: Easy Google Takeout data import
- **⚡ Real-time Processing**: Background processing with progress tracking

## 🛠️ Tech Stack

### Frontend

- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Shadcn UI**: UI components
- **Framer Motion**: Smooth animations

### Backend

- **MongoDB**: NoSQL database
- **Mongoose**: MongoDB object modeling
- **Better Auth**: Authentication system
- **Inngest**: Background job processing

### Development

- **Biome**: Fast linting and formatting
- **pnpm**: Package manager
- **Turbopack**: Fast bundler

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
   
   # Background Jobs
   INNGEST_EVENT_KEY=your-inngest-event-key
   INNGEST_SIGNING_KEY=your-inngest-signing-key
   
   # YouTube API (for additional data)
   YOUTUBE_API_KEY=your-youtube-api-key
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
- **Additional Insights**: Average song length, listening sessions, and trends

## 🏗️ Project Structure

```
├── app/                      # Next.js App Router pages
│   ├── api/                  # API routes
│   ├── auth/                 # Authentication pages
│   ├── dashboard/            # Dashboard page
│   ├── upload/               # File upload page
│   └── layout.tsx            # Root layout
├── components/               # React components
│   ├── ui/                   # UI components (buttons, cards, etc.)
│   ├── dashboard/            # Dashboard-specific components
│   └── ...                   # Other components
├── lib/                      # Utility libraries
│   ├── auth/                 # Authentication configuration
│   ├── db/                   # Database models and connection
│   ├── services/             # Business logic services
│   └── types/                # TypeScript type definitions
├── hooks/                    # Custom React hooks
└── public/                   # Static assets
```

## 🗄️ Database Schema

The application uses MongoDB with the following main collections:

- **Users**: User account information
- **UserMusicHistories**: Individual listening history entries
- **UserStats**: Aggregated user statistics
- **Songs**: Song metadata and information

## 🔧 Configuration

### Authentication

The app supports multiple authentication methods:

- Email/password registration
- Google OAuth integration

Configure these in `lib/auth/config.ts` and your environment variables.

### File Processing

Google Takeout files are processed using:

- Background job processing with Inngest
- Intelligent song title parsing
- Duplicate detection and handling
- Progress tracking for large files

### API Rate Limiting

API endpoints are protected with rate limiting to prevent abuse.

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

### Visualizations

- Play count trends over time
- Top artists bar charts
- Top songs rankings
- Listening pattern heatmaps
- Monthly/weekly breakdowns

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

- Check file size limits (max 10MB)
- Ensure the file is a valid JSON from Google Takeout

**Authentication Issues**

- Verify MongoDB connection
- Check Better Auth configuration
- Ensure environment variables are set correctly

**Processing Stuck**

- Check Inngest dashboard for job status
- Verify background job configuration
- Check server logs for errors

### Getting Help

- Check the [Issues](https://github.com/DestroyerV/ytmusic-stats/issues) page
- Create a new issue with detailed information
- Include error messages and steps to reproduce

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Made with ❤️ by [Vaibhav Mishra](https://github.com/DestroyerV)**
