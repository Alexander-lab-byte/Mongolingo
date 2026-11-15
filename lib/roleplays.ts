// Role-play partners for Yarii AI (shared by the page and /api/ai).
export const ROLEPLAYS = [
  { id: "taxi", emoji: "🚕", title: "Taxi driver", role: "a friendly Ulaanbaatar taxi driver", situation: "The learner just got into your taxi near Sükhbaatar Square. Ask where they want to go, then talk about the route and the price." },
  { id: "market", emoji: "🧣", title: "Market seller", role: "a cashmere seller at Narantuul market", situation: "The learner is looking at a cashmere scarf. Tell them the price and let them bargain politely." },
  { id: "landlord", emoji: "🏠", title: "Landlord", role: "the learner's landlord", situation: "It is January and the learner calls because the heating in their apartment is not working." },
  { id: "pharmacy", emoji: "💊", title: "Pharmacist", role: "a pharmacist in Ulaanbaatar", situation: "The learner has a cold and a sore throat and needs medicine. Ask simple questions." },
  { id: "coworker", emoji: "💼", title: "New coworker", role: "a new Mongolian coworker", situation: "It is the learner's first day at work. Introduce yourself, ask their name and where they are from." },
  { id: "ger", emoji: "🛖", title: "Herder family", role: "a herder welcoming a guest to your ger in the countryside", situation: "The learner arrives at your ger. Greet them, offer milk tea and ask about their trip." },
] as const;
