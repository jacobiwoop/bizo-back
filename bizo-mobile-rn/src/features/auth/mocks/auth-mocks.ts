export type OnboardingSlide = {
  id: string;
  title: string;
  description: string;
  art: "cards" | "cart" | "phone";
};

export const onboardingSlides: OnboardingSlide[] = [
  {
    id: "all-in-one",
    title: "Everything you need\nall in one app",
    description: "Easy shopping for all your needs just in hand trusted by millions of people in the world",
    art: "cards",
  },
  {
    id: "one-best-app",
    title: "One best app for all\nyour need",
    description: "Easy shopping for all your needs just in hand trusted by millions of people in the world",
    art: "cart",
  },
  {
    id: "unused-cash",
    title: "Turn Your Unused Stuff\nInto Cash",
    description: "Easy shopping for all your needs just in hand trusted by millions of people in the world",
    art: "phone",
  },
];

export const authMocks = {
  signIn: {
    username: "",
    password: "",
  },
  signUp: {
    username: "",
    contact: "",
    password: "",
  },
  forgotPassword: {
    contact: "roberts.adams@gmail.com",
  },
  createPassword: {
    oldPassword: "robertsadams2121",
    newPassword: "987654321",
  },
  verification: {
    destination: "robert.adams@email.com",
    initialCode: ["6", "0", "4", ""],
  },
};
