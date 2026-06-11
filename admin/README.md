# ប្រព័ន្ធគ្រប់គ្រងកាលវិភាគសិក្សា និងសម្រង់វត្តមាននិស្សិតនៅសាកលវិទ្យាល័យអង្គរ

ប្រព័ន្ធនេះជាប្រព័ន្ធគ្រប់គ្រងកាលវិភាគសិក្សា និងវត្តមាននិស្សិត សម្រាប់សាកលវិទ្យាល័យអង្គរ។  
មានមុខងារចម្បង៖ បង្ហាញកាលវិភាគ, គ្រប់គ្រងវត្តមាន, គ្រប់គ្រងមុខវិជ្ជា, គ្រូបង្រៀន, និងក្រុមនិស្សិត។

---

## Libraries ប្រើប្រាស់

- [React js](https://react.dev/) — UI Framework
- [Zustand](https://zustand-demo.pmnd.rs/) — State Management
- [Tanstack Router](https://tanstack.com/router/latest) — Routing
- [Tanstack Table](https://tanstack.com/table/latest) — Table/Grid
- [Radix UI](https://www.radix-ui.com/) — UI Components
- [Tailwind CSS](https://tailwindcss.com/) — CSS Utility
- [I18N](https://www.i18next.com/) — ភាសាច្រើន

---

## Getting Started

### ១. តំឡើង Dependencies

```bash
npm install
# ឬ
yarn install
# ឬ
pnpm install
# ឬ
bun install
```

### ២. ចាប់ផ្តើម Server (Mock API)

```bash
npm run server
# ឬ
yarn server
# ឬ
pnpm server
# ឬ
bun server
```

### ៣. ចាប់ផ្តើម App

```bash
npm run dev
# ឬ
yarn dev
# ឬ
pnpm dev
# ឬ
bun dev
```

---

## .env Example

បង្កើតឯកសារ `.env` នៅ root project:

```
VITE_API_URL=http://localhost:5000
```

---

## Project File Tree

```
frontend-web/
├── src/
│   ├── main.tsx
│   ├── routes/
│   └── components/
├── public/
│   └── index.html
├── data/
│   └── db.json
├── package.json
├── bun.lockb
├── tsconfig.json
└── .env
```

---

## Useful Commands

- **Format code:**  
  `npm run format`
- **Lint:**  
  `npm run lint`
- **Build:**  
  `npm run build`

---

## License

This project is licensed under the MIT License – feel free to use and modify it.
