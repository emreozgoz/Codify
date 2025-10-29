# Codify - Postman Collection to Code Generator

<div align="center">

Convert your Postman collections into ready-to-use code snippets in multiple programming languages.

[![Next.js](https://img.shields.io/badge/Next.js-16.0-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8)](https://tailwindcss.com/)

</div>

## 🚀 Features

- **📤 Easy Upload**: Drag & drop or select your Postman collection JSON file
- **🔄 Multiple Languages**: Generate code in JavaScript (Fetch), Python (Requests), and cURL
- **🎨 Syntax Highlighting**: Beautiful code preview with line numbers
- **📋 Copy & Download**: Copy to clipboard or download as files
- **🎯 Smart Parsing**: Automatically handles URLs, headers, query params, body, and authentication
- **💅 Modern UI**: Clean, responsive interface built with shadcn/ui

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **State Management**: Zustand
- **Syntax Highlighting**: react-syntax-highlighter
- **File Upload**: react-dropzone

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/codify.git

# Navigate to project directory
cd codify

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## 🎯 Usage

1. **Upload Collection**:
   - Drag & drop your Postman collection JSON file
   - Or click to browse and select a file

2. **Select Request**:
   - Choose a request from the sidebar
   - View request details and method

3. **Generate Code**:
   - Select your preferred programming language
   - Copy the generated code or download as a file

## 📝 Supported Features

### Request Types
- ✅ GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS

### Authentication
- ✅ Bearer Token
- ✅ Basic Auth
- ✅ API Key

### Body Types
- ✅ JSON
- ✅ URL Encoded
- ✅ Form Data
- ✅ Raw

### Code Generation
- ✅ JavaScript (Fetch API)
- ✅ Python (Requests library)
- ✅ cURL

## 📂 Project Structure

```
codify/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── page.tsx           # Main page
│   │   ├── layout.tsx         # Root layout
│   │   └── globals.css        # Global styles
│   │
│   ├── components/            # React components
│   │   ├── ui/               # shadcn/ui components
│   │   ├── layout/           # Layout components
│   │   ├── upload/           # File upload
│   │   ├── collection/       # Request list
│   │   ├── code/             # Code preview
│   │   └── shared/           # Shared components
│   │
│   ├── lib/                  # Core logic
│   │   ├── types/           # TypeScript types
│   │   ├── parsers/         # Postman parser
│   │   └── generators/      # Code generators
│   │
│   └── store/               # Zustand store
│
├── public/
│   └── examples/            # Sample collections
│
└── package.json
```

## 🧪 Example Collection

A sample Postman collection is included in `public/examples/sample-collection.json` for testing.

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

Or connect your GitHub repository to Vercel for automatic deployments.

## 🛣️ Roadmap

- [ ] Add more languages (Node.js with Axios, PHP, Go, Ruby)
- [ ] Support environment variables
- [ ] Batch code generation
- [ ] Dark/Light theme toggle
- [ ] Import from URL
- [ ] Export all requests at once
- [ ] Code templates customization

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 👏 Acknowledgments

- [Postman](https://www.postman.com/) for the collection format
- [shadcn/ui](https://ui.shadcn.com/) for the beautiful components
- [Next.js](https://nextjs.org/) for the amazing framework

---

Made with ❤️ by [Your Name]
