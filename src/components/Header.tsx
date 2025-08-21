'use client';

import Navigation from './Navigation';

interface HeaderProps {
  showVideoBackground?: boolean;
  title?: string;
  subtitle?: string;
  description?: string;
  icon?: string;
}

export default function Header({ 
  showVideoBackground = false, 
  title, 
  subtitle, 
  description, 
  icon 
}: HeaderProps) {
  return (
    <header>
      {showVideoBackground && (
        <div className="vid-back">
          <div className="overlay"></div>
          <div className="video">
            <video 
              playsInline 
              autoPlay 
              muted 
              loop 
              poster="/assets/img/backpic.jpg" 
              id="bgvid"
            >
              <source src="/assets/img/backvid.mp4" type="video/mp4" />
            </video>
          </div>
          <div className="hero-content">
          <div className="headings">
            <h2>Looking <span>For</span> Coins<span>.</span></h2>
          </div>
          <div className="subheadings">
            <h5>Play <span className="fn">Fortnite</span> Tokens, Win <span>Coins</span>.</h5>
          </div>
          <div className="hero-btns">
              <a href="https://discord.gg/JtmxFYAw7W" target="_blank" className="ds"><i className="fab fa-discord"></i><span>Join now our <br/> Discord Server</span></a>
          </div>
      </div>

      <div className="bottom-hero">
          <div className="live">
              <span><i className="fas fa-circle"></i> 126 Live Players</span> 
          </div>
          <div className="explorebtn">
              <a href="#matches" id="explore-trigger" className="explore vertical animated link-s">
                  <span>Explore</span>
                  <span>Explore</span>
                  <span>Explore</span>
              </a>
          </div>
      </div>
        </div>
      )}
      
      <Navigation />
      
      {title && (
        <div className="sec-title">
          <span>
            {icon && <i className={icon}></i>} {title}
          </span>
          <h2>{subtitle}</h2>
          <p>{description}</p>
        </div>
      )}
    </header>
  );
}
