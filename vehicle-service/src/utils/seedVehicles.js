const vehicleRepository = require("../repositories/vehicleRepository");

const seedData = [
  {
    name: "VW ID.4 Horizon",
    slug: "vw-id4-horizon",
    category: "Electric",
    tagline: "All-electric confidence with a quiet, premium cabin.",
    description:
      "A refined electric SUV built for daily range, confident handling, and modern connected driving. The ID.4 Horizon blends spacious utility with a calm digital cockpit.",
    price: 42995,
    currency: "USD",
    horsepower: 295,
    rangeKm: 443,
    drivetrain: "AWD",
    acceleration: "5.8s 0-60 mph",
    imageUrl:
      "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&w=1400&q=80",
    imageUrls: [
      "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1400&q=80"
    ],
    specs: {
      battery: "82 kWh",
      charging: "DC fast charging",
      seats: 5,
      safety: "IQ.DRIVE assistance suite"
    },
    isFeatured: true
  },
  {
    name: "VW Golf GTI Pulse",
    slug: "vw-golf-gti-pulse",
    category: "Performance",
    tagline: "Compact performance with sharp steering and daily comfort.",
    description:
      "A modern hot hatch experience with turbocharged power, precise handling, and an interior tuned for drivers who want premium practicality.",
    price: 32995,
    currency: "USD",
    horsepower: 241,
    rangeKm: null,
    drivetrain: "FWD",
    acceleration: "5.9s 0-60 mph",
    imageUrl:
      "https://images.unsplash.com/photo-1603386329225-868f9b1ee6c9?auto=format&fit=crop&w=1400&q=80",
    imageUrls: [
      "https://images.unsplash.com/photo-1603386329225-868f9b1ee6c9?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1400&q=80"
    ],
    specs: {
      engine: "2.0L turbo",
      transmission: "7-speed DSG",
      seats: 5,
      wheels: "19-inch performance alloys"
    },
    isFeatured: true
  },
  {
    name: "VW Atlas Grandline",
    slug: "vw-atlas-grandline",
    category: "SUV",
    tagline: "Three-row versatility with executive road presence.",
    description:
      "A spacious SUV designed for families, long trips, and confident daily driving. The Atlas Grandline focuses on comfort, storage, and connected convenience.",
    price: 48995,
    currency: "USD",
    horsepower: 269,
    rangeKm: null,
    drivetrain: "AWD",
    acceleration: "7.5s 0-60 mph",
    imageUrl:
      "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1400&q=80",
    imageUrls: [
      "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1400&q=80"
    ],
    specs: {
      engine: "2.0L turbo",
      seats: 7,
      cargo: "96.8 cu ft maximum",
      towing: "5,000 lb"
    },
    isFeatured: false
  },
  {
    name: "VW Arteon Blackline",
    slug: "vw-arteon-blackline",
    category: "Sedan",
    tagline: "Sleek fastback design with long-distance composure.",
    description:
      "A premium sedan profile with a broad stance, quiet cabin, and elegant controls. The Arteon Blackline gives business travel a performance edge.",
    price: 45995,
    currency: "USD",
    horsepower: 300,
    rangeKm: null,
    drivetrain: "AWD",
    acceleration: "4.6s 0-60 mph",
    imageUrl:
      "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1400&q=80",
    imageUrls: [
      "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1400&q=80"
    ],
    specs: {
      engine: "2.0L turbo",
      transmission: "7-speed DSG",
      seats: 5,
      audio: "Premium surround audio"
    },
    isFeatured: true
  },
  {
    name: "VW Polo Urban",
    slug: "vw-polo-urban",
    category: "Hatchback",
    tagline: "City-friendly agility with thoughtful technology.",
    description:
      "A compact hatchback tuned for urban efficiency, easy parking, and crisp controls. The Polo Urban keeps the cabin premium while staying approachable.",
    price: 21995,
    currency: "USD",
    horsepower: 115,
    rangeKm: null,
    drivetrain: "FWD",
    acceleration: "9.8s 0-60 mph",
    imageUrl:
      "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=1400&q=80",
    imageUrls: [
      "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?auto=format&fit=crop&w=1400&q=80"
    ],
    specs: {
      engine: "1.0L turbo",
      seats: 5,
      efficiency: "Excellent urban mileage",
      display: "Digital cockpit"
    },
    isFeatured: false
  },
  {
    name: "VW Trinity Concept",
    slug: "vw-trinity-concept",
    category: "Concept",
    tagline: "A future-facing electric sedan study with autonomous-ready design.",
    description:
      "A concept vehicle for future mobility learning, combining electric range, software-defined architecture, and a lounge-like interior experience.",
    price: 68995,
    currency: "USD",
    horsepower: 355,
    rangeKm: 600,
    drivetrain: "AWD",
    acceleration: "4.2s 0-60 mph",
    imageUrl:
      "https://images.unsplash.com/photo-1610647752706-3bb12232b3a8?auto=format&fit=crop&w=1400&q=80",
    imageUrls: [
      "https://images.unsplash.com/photo-1610647752706-3bb12232b3a8?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1571607388263-1044f9ea01dd?auto=format&fit=crop&w=1400&q=80"
    ],
    specs: {
      battery: "Next-generation pack",
      charging: "Ultra-fast DC concept",
      seats: 4,
      software: "Software-defined vehicle platform"
    },
    isFeatured: true
  }
];

async function seedVehicles() {
  const count = await vehicleRepository.countVehicles();
  if (count > 0) {
    return;
  }

  for (const vehicle of seedData) {
    await vehicleRepository.createVehicle(vehicle);
  }
}

module.exports = { seedVehicles };
