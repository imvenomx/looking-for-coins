
export const metadata = {
  title: "Matches | Looking For Coins",
  description: "Browse and join live Fortnite matches and tournaments."
};

export const viewport = {
  width: "device-width",
  initialScale: 1.0,
};


import MatchesClient from "./MatchesClient";

export default function Matches() {
  return <MatchesClient />;
}
