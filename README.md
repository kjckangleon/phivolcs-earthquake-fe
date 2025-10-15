# 🌏 PHIVOLCS Earthquake Activity Map

An interactive web application that visualizes recent seismic events in the Philippines using live data from the **Philippine Institute of Volcanology and Seismology (PHIVOLCS)**.  
Built with **React**, **Leaflet**, and **Framer Motion**, this project provides an engaging and informative way to explore earthquake activity across the country.

🔗 **Live Demo:** [https://phivolcs-earthquake-fe.vercel.app/](https://phivolcs-earthquake-fe.vercel.app/)

---

## 🧭 Features

- **Live Earthquake Data** — Displays recent seismic events fetched from PHIVOLCS data sources.  
- **Interactive Map** — Uses Leaflet for dynamic visualization and precise earthquake markers.  
- **Expandable Details** — Each event can be expanded to reveal depth, magnitude, and location info.  
- **Responsive Design** — Works smoothly on both desktop and mobile devices.  
- **Animated UI** — Framer Motion provides smooth transitions and an engaging experience.  
- **Filter & Sort (optional)** — Easily customizable for enhanced data exploration.

---

## 🛠️ Tech Stack

| Category | Technologies |
|-----------|---------------|
| **Frontend** | React (Vite or CRA) |
| **UI / Styling** | Tailwind CSS, Framer Motion |
| **Mapping** | Leaflet, React-Leaflet |
| **Icons** | Lucide React |
| **Deployment** | Vercel |

---

## ⚙️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/<your-username>/phivolcs-earthquake-map.git
   cd phivolcs-earthquake-map
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. Open in browser:  
   [http://localhost:5173](http://localhost:5173)

---

## 📁 Folder Structure

```
phivolcs-earthquake-map/
├── src/
│   ├── components/
│   │   ├── EarthquakeMap.jsx
│   │   ├── PhivolcsDataFetcher.jsx
│   │   └── ...
│   ├── assets/
│   ├── styles/
│   └── main.jsx
├── public/
├── package.json
└── README.md
```

---

## 🚀 Deployment

This project is deployed via **Vercel** for easy CI/CD integration.

To deploy your own version:

```bash
npm run build
vercel deploy
```

## 📡 API Source

Data provided by the **PHIVOLCS Earthquake Information API**.  
Visit: [https://earthquake.phivolcs.dost.gov.ph/](https://earthquake.phivolcs.dost.gov.ph/)

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!  
Feel free to open a [pull request](https://github.com/<your-username>/phivolcs-earthquake-map/pulls) or submit an issue.

---

## 🧑‍💻 Author

**Karl Joseph C. Kangleon**  
[LinkedIn](https://www.linkedin.com/in/kjckangleon/) • [Email](mailto:kjckangleon@gmail.com)  
Frontend Developer • React | TypeScript | Kotlin | TailwindCSS

---

## 📝 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

### ⭐ If you like this project, please give it a star on GitHub!
