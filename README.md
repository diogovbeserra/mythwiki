
# 🛡️ Myth Wiki - Game Database

Comprehensive database and tools for **Myth of Yggdrasil** game. Browse items, monsters, crafts, and use powerful farming optimization tools.

![Myth Wiki](public/og-image.png)

## 🌐 Live Demo

🔗 **[myth-wiki.abacusai.app](https://myth-wiki.abacusai.app)**

---

## ✨ Features

- 🗡️ **Items Database** - Browse weapons, armor, consumables, and more
- 👹 **Monsters Database** - Detailed monster information with drops and stats
- ⚒️ **Crafts System** - View crafting recipes and requirements
- 🎯 **Farm Optimizer** (BETA) - AI-powered tool to find the best monsters to farm
- 👥 **Character Builder** - Create and manage character builds
- 📈 **Farm Tracker** - Track your drops and profits
- ⚡ **Element Table** - Elemental multipliers reference
- 🔍 **Global Search** - Search across all items and monsters
- 📊 **Advanced Filters** - Filter by type, rarity, level, and more

---

## 🚀 Technologies

- **Framework:** [Next.js 14](https://nextjs.org/) (App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Database:** [PostgreSQL](https://www.postgresql.org/) with [Prisma ORM](https://www.prisma.io/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **UI Components:** [shadcn/ui](https://ui.shadcn.com/) + [Radix UI](https://www.radix-ui.com/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Package Manager:** [Yarn](https://yarnpkg.com/)

---

## 📋 Prerequisites

Before running this project, make sure you have:

- **Node.js** 18.x or higher ([Download](https://nodejs.org/))
- **Yarn** 1.22.x or higher ([Installation](https://yarnpkg.com/getting-started/install))
- **PostgreSQL** 14.x or higher ([Download](https://www.postgresql.org/download/))

---

## ⚙️ Installation

### 1. Clone the repository

```bash
git clone https://github.com/diogovbeserra/mythwiki.git
cd mythwiki
```

### 2. Install dependencies

```bash
yarn install
```

### 3. Configure environment variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/myth_wiki?schema=public"

# Optional: Analytics
# NEXT_PUBLIC_GA_MEASUREMENT_ID="G-XXXXXXXXXX"
```

Replace `USER` and `PASSWORD` with your PostgreSQL credentials.

### 4. Setup the database

```bash
# Create database schema
yarn prisma migrate dev

# Generate Prisma Client
yarn prisma generate

# Seed the database with game data
yarn prisma db seed
```

This will:
- Create all necessary database tables
- Parse game data from YAML and Lua files
- Populate the database with items, monsters, and crafts

---

## 🏃 Running the Project

### Development Mode

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
# Build the project
yarn build

# Start production server
yarn start
```

---

## 📁 Project Structure

```
mythwiki/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── items/             # Items pages
│   ├── monsters/          # Monsters pages
│   ├── crafts/            # Crafts pages
│   ├── tools/             # Tools pages (optimizer, tracker, etc.)
│   └── search/            # Search page
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── *.tsx             # Feature components
├── data/                  # Game data files
│   ├── DB_ItemInfo.yml   # Items database
│   ├── DB_MobInfo.yml    # Monsters database
│   └── *.lua             # Lua data files
├── lib/                   # Utilities and helpers
│   ├── db.ts             # Database queries
│   ├── parsers/          # Data parsers (YAML, Lua)
│   └── types.ts          # TypeScript types
├── prisma/               # Prisma ORM
│   └── schema.prisma     # Database schema
├── scripts/              # Seed scripts
│   └── seed.ts           # Database seeding
└── public/               # Static assets
```

---

## 🗄️ Database Schema

The project uses **Prisma** with **PostgreSQL**. Main models:

- **Item** - Game items (weapons, armor, consumables, etc.)
- **Monster** - Game monsters with stats and drops
- **Drop** - Monster drop rates
- **Craft** - Crafting recipes

View the complete schema in `prisma/schema.prisma`.

---

## 🎮 Game Data

The project parses data from:

- `data/DB_ItemInfo.yml` - Items information
- `data/DB_MobInfo.yml` - Monsters information
- `data/itemInfo_Myth_of_Yggdrasil.lua` - Additional item data
- `data/MoY Mats.xlsx` - Materials spreadsheet

Data is automatically parsed and seeded when running `yarn prisma db seed`.

---

## 🛠️ Available Scripts

```bash
# Development
yarn dev              # Start development server
yarn build            # Build for production
yarn start            # Start production server
yarn lint             # Run ESLint

# Database
yarn prisma migrate dev    # Run migrations
yarn prisma generate       # Generate Prisma Client
yarn prisma db seed        # Seed database
yarn prisma studio         # Open Prisma Studio (DB GUI)

# TypeScript
yarn tsc --noEmit         # Type checking
```

---

## 🌟 Key Features Explained

### Farm Optimizer
AI-powered tool that calculates the best monsters to farm based on:
- Your average DPS
- Kill time and respawn intervals
- Drop rates and item values
- Elemental advantages

### Element Table
Reference for elemental damage multipliers:
- Level 1-4 multipliers for each element combination
- Interactive table for quick reference

### Character Builder
Plan and optimize your character builds:
- Equipment selection
- Stat calculations
- Build sharing

---

## 🚀 Deployment

The project is deployed on **Abacus.AI** platform.

To deploy your own instance:

1. Push your changes to GitHub
2. Connect your repository to your hosting platform
3. Set environment variables
4. Run build command: `yarn build`
5. Start command: `yarn start`

---

## 🤝 Contributing

Contributions are welcome! Feel free to:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is for educational purposes. Game data belongs to **Myth of Yggdrasil**.

---

## 👤 Author

**Diogo Beserra**
- GitHub: [@diogovbeserra](https://github.com/diogovbeserra)

---

## 🙏 Acknowledgments

- Game data from **Myth of Yggdrasil**
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)

---

## 📧 Support

If you have any questions or issues, please open an issue on GitHub.

---

Made with ❤️ for the Myth of Yggdrasil community
