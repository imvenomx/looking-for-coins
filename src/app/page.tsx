
import Image from "next/image";
import Header from "@/components/Header";

export const metadata = {
  title: "Looking For Coins",
  description: "Compete in a variety of gamemodes such as box fights, build fights, and zone wars!",
};

export const viewport = {
  width: "device-width",
  initialScale: 1.0,
};

export default function Home() {
  return (
    <>
      <Header showVideoBackground={true} />
      
      <div className="content">
        {/* Streams Section */}
        <section className="streams">
          <div className="container">
            <div className="streams-block">
              <div className="stream-left">
                <div className="sec-title left">
                  <span className="purple">
                    <i className="fab fa-twitch"></i>Live Streams
                  </span>
                  <h2>Watch Featured Streams</h2>
                  <p>Tune in regularly to watch live streams of our players fighting for the glory and win the token prize.</p>
                </div>
              </div>
              <div className="streamsloop">
                {[
                  "#LFC - Zonewars 2v2",
                  "#LFC - Build Fight", 
                  "#LFC - Zonewars Fight",
                  "#LFC - Peterbot Build Fight",
                  "#LFC - Some realistic buildfights",
                  "#LFC - Zonewars 3v3"
                ].map((title, index) => (
                  <div key={index} className="single-stream">
                    <div className="streamimg">
                      <Image src="/assets/img/ingame.jpeg" alt="Stream" width={300} height={200} />
                    </div>
                    <div className="stream-meta">
                      <div className="streamer-img">
                        <Image src="/assets/img/banana.jpg" alt="Streamer" width={40} height={40} />
                      </div>
                      <div className="streamer-info">
                        <h3>{title}</h3>
                        <span>Peterbot</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Matches Section */}
        <section className="matches" id="matches2">
          <div className="container">
            <div className="matchrow">
              <div className="matchlist">
                <div className="sec-title">
                  <span><i className="fas fa-gamepad"></i> Matches</span>
                  <h2>Live Ongoing Matches</h2>
                  <p>Discover and watch live matches between players on different gameplay modes fighting to win the prize.</p>
                </div>
                <div className="matchesloop">
                  <div className="row">
                    {[1, 2, 3, 4, 5, 6].map((match, index) => (
                      <div key={index} className="singlematch">
                        <h2>1V1 Box Fight</h2>
                        <div className="matchcontent">
                          <div className="countdown">
                            <div className="base-timer">
                              <svg className="base-timer__svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                                <g className="base-timer__circle">
                                  <circle className="base-timer__path-elapsed" cx="50" cy="50" r="45"></circle>
                                  <path id="base-timer-path-remaining" strokeDasharray="283" className="base-timer__path-remaining arc"
                                        d="M 50, 50 m -45, 0 a 45,45 0 1,0 90,0 a 45,45 0 1,0 -90,0"></path>
                                </g>
                              </svg>
                              <div className="timer-label">Expire in <br/><span id="base-timer-label" className="base-timer__label">30:00</span></div>
                            </div>
                          </div>
                          <div className="joindetails">
                                                <div className="matchdetails">
                                                    <div className="single-det">
                                                        <label>Region</label>
                                                        <span>EU</span>
                                                    </div>
                                                    <div className="single-det">
                                                        <label>Platform</label>
                                                        <span>PC</span>
                                                    </div>
                                                    <div className="single-det">
                                                        <label>First To</label>
                                                        <span>5+2</span>
                                                    </div>
                                                    <div className="single-det">
                                                        <label>Host</label>
                                                        <span>RANDOM</span>
                                                    </div>
                                                    <div className="single-det">
                                                        <label>Entry Fee</label>
                                                        <span>$5.00</span>
                                                    </div>
                                                    <div className="single-det bet">
                                                        <label>Prize</label>
                                                        <span>$9.00</span>
                                                    </div>
                                                </div>
                                                <span className="viewopponent"><i className="fa-solid fa-eye"></i>View opponent</span>
                                                <a href="#" className="joinmatch mt-1">Join the match</a>
                                            </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="leaderboard">
                            <div className="sec-title nm">
                                <span><i className="fas fa-gamepad"></i> Leaderboard</span>
                                <h2>Top Winners of all time</h2>
                            </div>
                            <div className="leaderloop">
                                <div className="single-leader">
                                    <div className="lefty">
                                        <span className="top">1</span>
                                        <img src="assets/img/user.png" className="leaderimg"/>
                                        <div className="leader-det">
                                            <span>Anwar VeNomX</span>
                                            <label>789 Matches</label>
                                        </div>
                                    </div>
                                    <div className="righty">
                                        <span className="earn">$560.00</span>
                                    </div>
                                </div>
                                <div className="single-leader">
                                    <div className="lefty">
                                        <span className="top">2</span>
                                        <img src="assets/img/user.png" className="leaderimg"/>
                                        <div className="leader-det">
                                            <span>Anwar VeNomX</span>
                                            <label>789 Matches</label>
                                        </div>
                                    </div>
                                    <div className="righty">
                                        <span className="earn">$420.00</span>
                                    </div>
                                </div>
                                <div className="single-leader">
                                    <div className="lefty">
                                        <span className="top">3</span>
                                        <img src="assets/img/user.png" className="leaderimg"/>
                                        <div className="leader-det">
                                            <span>Anwar VeNomX</span>
                                            <label>789 Matches</label>
                                        </div>
                                    </div>
                                    <div className="righty">
                                        <span className="earn">$375.00</span>
                                    </div>
                                </div>
                                <div className="single-leader">
                                    <div className="lefty">
                                        <span className="top">4</span>
                                        <img src="assets/img/user.png" className="leaderimg"/>
                                        <div className="leader-det">
                                            <span>Anwar VeNomX</span>
                                            <label>789 Matches</label>
                                        </div>
                                    </div>
                                    <div className="righty">
                                        <span className="earn">$350.00</span>
                                    </div>
                                </div>
                                <div className="single-leader">
                                    <div className="lefty">
                                        <span className="top">5</span>
                                        <img src="assets/img/user.png" className="leaderimg"/>
                                        <div className="leader-det">
                                            <span>Anwar VeNomX</span>
                                            <label>789 Matches</label>
                                        </div>
                                    </div>
                                    <div className="righty">
                                        <span className="earn">$280.00</span>
                                    </div>
                                </div>
                                <div className="single-leader">
                                    <div className="lefty">
                                        <span className="top">6</span>
                                        <img src="assets/img/user.png" className="leaderimg"/>
                                        <div className="leader-det">
                                            <span>Anwar VeNomX</span>
                                            <label>789 Matches</label>
                                        </div>
                                    </div>
                                    <div className="righty">
                                        <span className="earn">$116.00</span>
                                    </div>
                                </div>
                                <div className="single-leader">
                                    <div className="lefty">
                                        <span className="top">7</span>
                                        <img src="assets/img/user.png" className="leaderimg"/>
                                        <div className="leader-det">
                                            <span>Anwar VeNomX</span>
                                            <label>789 Matches</label>
                                        </div>
                                    </div>
                                    <div className="righty">
                                        <span className="earn">$86.00</span>
                                    </div>
                                </div>
                            </div>
                            <a href="#" className="seemore">See Full Leaderboard</a>
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
