# Sugar Diagnostic Lab

A modern web application for managing diagnostic laboratory operations, built with Next.js 15 and TypeScript.

## 🚀 Features

- **Modern UI/UX**: Built with Radix UI components and styled with Tailwind CSS
- **Admin Dashboard**: Secure admin interface for managing lab operations
- **Patient Management**: Track and manage patient records and test results
- **Report Generation**: Generate and export PDF reports using jsPDF
- **Responsive Design**: Fully responsive interface that works on all devices
- **Dark Mode Support**: Built-in dark mode using next-themes
- **Form Validation**: Robust form handling with react-hook-form and zod
- **Data Visualization**: Interactive charts and graphs using Recharts
- **Real-time Updates**: Toast notifications using Sonner

## 🛠️ Tech Stack

- **Framework**: Next.js 15
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **Form Handling**: React Hook Form + Zod
- **Database**: Supabase
- **PDF Generation**: jsPDF
- **Charts**: Recharts
- **Date Handling**: date-fns
- **Notifications**: Sonner

## 📦 Installation

1. Clone the repository:
   ```bash
   git clone [repository-url]
   cd sugar-diagnostic-lab
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory and add your environment variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Run the development server:
   ```bash
   pnpm dev
   ```

## 🏗️ Project Structure

```
sugar-diagnostic-lab/
├── app/                # Next.js app directory
│   ├── admin/         # Admin dashboard
│   ├── api/           # API routes
│   └── landing/       # Landing page
├── components/        # Reusable components
├── hooks/            # Custom React hooks
├── lib/              # Utility functions and configurations
├── public/           # Static assets
└── styles/           # Global styles
```

## 🚀 Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint

## 🔒 Security

- Admin authentication required for sensitive operations
- Environment variables for secure configuration
- Type-safe API calls with TypeScript

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Authors

- Your Name - Initial work

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Radix UI for the accessible components
- All other open-source contributors
