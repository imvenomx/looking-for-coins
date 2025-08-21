import React from "react";
import Image from "next/image";

interface Match {
  id: string;
  user_id: string;
  opponent_id?: string;
  opponent_name: string;
  match_date: string;
  result: string | null;
  betting_amount: number;
  created_at: string;
  game_mode: string;
  is_public: boolean;
  first_to: number;
  platform: string;
  region: string;
  team_size: number;
  match_type?: string;
  entry_fee?: number;
  prize?: string;
  status?: string;
  expires_at?: string;
}

const gameModeTitles: { [key: string]: string } = {
  boxfights: 'Box Fight',
  buildfights: 'Build Fight',
  realistic: 'Realistic',
  zerobuild: 'Zero Build',
  zonewars: 'Zone Wars',
  killrace: 'Kill Race',
  creative: 'Creative',
  battleroyale: 'Battle Royale'
};

const platformNames: { [key: string]: string } = {
  pc: 'PC',
  console: 'Console',
  mobile: 'Mobile',
  any: 'Any Platform'
};

const regionNames: { [key: string]: string } = {
  nae: 'NA East',
  naw: 'NA West',
  nac: 'NA Central',
  eu: 'Europe',
  asia: 'Asia',
  oce: 'Oceania',
  br: 'Brazil'
};

interface MatchesListProps {
  matches: Match[];
  loading?: boolean;
  limit?: number;
}

const MatchesList: React.FC<MatchesListProps> = ({ matches, loading = false, limit = 6 }) => {
  const shownMatches = matches.slice(0, limit);

  if (loading) {
    return (
      <div className="text-center nomatch py-5">
        <i className="fas fa-spinner fa-spin fa-2x"></i>
        <p className="mt-3">Loading matches...</p>
      </div>
    );
  }

  if (shownMatches.length === 0) {
    return (
      <div className="text-center nomatch py-5">
        <i className="fas fa-gamepad fa-3x mb-3 opacity-50"></i>
        <h4>No matches available</h4>
        <p>Be the first to create a match!</p>
      </div>
    );
  }

  return (
    <div className="row">
      {shownMatches.map((match) => (
        <div key={match.id} className={`singlematch ${match.status === 'finished' ? 'finished-match' : ''}`}>
          <h2>
            {match.team_size}v{match.team_size} {gameModeTitles[match.game_mode] || match.game_mode}
            {match.status === 'finished' && (
              <span style={{
                backgroundColor: '#28a745',
                color: '#fff',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: 'bold',
                marginLeft: '10px',
                textTransform: 'uppercase'
              }}>
                Finished
              </span>
            )}
          </h2>
          <div className="matchcontent">
            {/* No countdown or join buttons for homepage preview */}
            <div className="joindetails">
              <div className="matchdetails">
                <div className="single-det">
                  <label>Region</label>
                  <span>{regionNames[match.region] || match.region}</span>
                </div>
                <div className="single-det">
                  <label>Platform</label>
                  <span>{platformNames[match.platform] || match.platform}</span>
                </div>
                <div className="single-det">
                  <label>First To</label>
                  <span>{match.first_to}</span>
                </div>
                <div className="single-det">
                  <label>Host</label>
                  <span>HOST</span>
                </div>
                <div className="single-det">
                  <label>Entry Fee</label>
                  <span>${(match.entry_fee || match.betting_amount).toFixed(2)}</span>
                </div>
                <div className="single-det bet">
                  <label>Prize</label>
                  <span>${match.prize || ((match.entry_fee || match.betting_amount) * 2 * 0.85).toFixed(2)}</span>
                </div>
              </div>
              <a href={`/match/${match.id}`} className="joinmatch mt-1">View match</a>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MatchesList;
