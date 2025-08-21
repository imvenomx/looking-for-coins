
import Image from "next/image";
import Header from "@/components/Header";

export default function Leaderboard() {
  const leaderboardData = [
    { rank: 1, name: "ProPlayer123", wins: 45, losses: 5, winRate: "90%", earnings: "1,250.00" },
    { rank: 2, name: "GamerElite", wins: 38, losses: 12, winRate: "76%", earnings: "980.50" },
    { rank: 3, name: "FortniteKing", wins: 35, losses: 15, winRate: "70%", earnings: "875.25" },
    { rank: 4, name: "BuildMaster", wins: 32, losses: 18, winRate: "64%", earnings: "720.00" },
    { rank: 5, name: "ZoneWarrior", wins: 28, losses: 22, winRate: "56%", earnings: "650.75" },
  ];

  return (
    <>
      <Header 
        showVideoBackground={false}
        title="Leaderboard"
        subtitle="Top Players Rankings"
        description="See who's dominating the competition and climbing the ranks!"
        icon="fas fa-trophy"
      />
      
      <div className="content">
        <section className="leaderboard">
          <div className="container">
            <div className="leaderboard">
                <div className="leaderloop">
                    {[...Array(20)].map((match, index) => (
                                <div key={index} className={`single-leader${index === 0 ? ' gold' : index === 1 ? ' silver' : index === 2 ? ' bronze' : ''}`}>
                                <div className="lefty">
                                    <span className="top">{index + 1}</span>
                                    <img src="assets/img/user.png" className="leaderimg" />
                                    <div className="leader-det">
                                        <span>Anwar VeNomX</span>
                                        <label>789 Matches</label>
                                    </div>
                                </div>
                                <div className="righty">
                                    <span className="earn">$350.00</span>
                                </div>
                            </div>
                    ))}
                </div>
                <div className="pagination">
                                    <div className="left-page">
                                        <span>Showing 1 to 20 of 100 Results</span>
                                    </div>
                                    <div className="right-page">
                                        <div className="prevp">
                                            <span>prev</span>
                                        </div>
                                        <div className="page-nums"> 
                                            <span className="active">1</span>
                                            <span>2</span>
                                        </div>
                                        <div className="nextp">
                                            <span>next</span>
                                        </div>
                                    </div>
                 </div> 
            </div>
          </div>
        </section>

        {/* Discord Section */}
                <section className="discordsec">
                  <div className="container">
                    <div className="sec-title">
                      <span className="purple"><i className="fab fa-discord"></i> Discord</span>
                      <h2>Join Our Community</h2>
                      <p>Connect with other players, get updates, and participate in tournaments through our Discord server.</p>
                    </div>
                    <div className="discord-area">
                      <div className="dscover">
                        <Image src="/assets/img/lfcpdp.png" alt="Discord"  width={400} height={200} />
                      </div>
                      <div className="dscontent">
                        <h2>Looking For Coins <i className="fas fa-check-circle" aria-hidden="true"></i></h2>
                        <a href="#" className="discord-btn">
                          <i className="fab fa-discord"></i> Join Discord
                        </a>
                      </div>
                    </div>
                  </div>
                </section>
      </div>

      {/* Footer */}
      <section className="footer-pre">
        <div className="footer__pre"></div>
      </section>
    </>
  );
}
