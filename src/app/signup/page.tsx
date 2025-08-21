
import Image from "next/image";
import Header from "@/components/Header";

export default function Signup() {
  return (
    <>
      <Header 
        showVideoBackground={false}
        title="Sign Up"
        subtitle="Join the Competition"
        description="Create your account and start competing in Fortnite tournaments!"
        icon="fas fa-user-plus"
      />
      
      <div className="content">
        <section className="signup">
          <div className="container">
            <div className="signup-content">
              <div className="signup-form">
                <div className="form-header">
                  <Image src="/assets/img/logo.png" alt="LFC Logo" width={60} height={60} />
                  <h2>Create Account</h2>
                  <p>Join thousands of players competing for prizes</p>
                </div>
                
                <form className="registration-form">
                  <div className="form-group">
                    <label htmlFor="username">Username</label>
                    <input type="text" id="username" name="username" placeholder="Enter your username" required />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <input type="email" id="email" name="email" placeholder="Enter your email" required />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input type="password" id="password" name="password" placeholder="Enter your password" required />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <input type="password" id="confirmPassword" name="confirmPassword" placeholder="Confirm your password" required />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="epicGames">Epic Games Username</label>
                    <input type="text" id="epicGames" name="epicGames" placeholder="Your Fortnite username" required />
                  </div>
                  
                  <div className="form-group checkbox">
                    <input type="checkbox" id="terms" name="terms" required />
                    <label htmlFor="terms">I agree to the Terms of Service and Privacy Policy</label>
                  </div>
                  
                  <div className="form-group checkbox">
                    <input type="checkbox" id="newsletter" name="newsletter" />
                    <label htmlFor="newsletter">Subscribe to our newsletter for updates and tournaments</label>
                  </div>
                  
                  <button type="submit" className="signup-btn">
                    <i className="fas fa-user-plus"></i>
                    Create Account
                  </button>
                </form>
                
                <div className="form-footer">
                  <p>Already have an account? <a href="/login">Sign In</a></p>
                </div>
              </div>
              
              <div className="signup-benefits">
                <h3>Why Join LFC?</h3>
                <div className="benefits-list">
                  <div className="benefit-item">
                    <i className="fas fa-trophy"></i>
                    <div>
                      <h4>Compete for Prizes</h4>
                      <p>Win real LFC tokens in competitive matches</p>
                    </div>
                  </div>
                  
                  <div className="benefit-item">
                    <i className="fas fa-gamepad"></i>
                    <div>
                      <h4>Multiple Game Modes</h4>
                      <p>Box fights, build fights, zone wars and more</p>
                    </div>
                  </div>
                  
                  <div className="benefit-item">
                    <i className="fas fa-users"></i>
                    <div>
                      <h4>Active Community</h4>
                      <p>Join thousands of competitive players</p>
                    </div>
                  </div>
                  
                  <div className="benefit-item">
                    <i className="fas fa-chart-line"></i>
                    <div>
                      <h4>Track Progress</h4>
                      <p>Monitor your stats and climb the leaderboard</p>
                    </div>
                  </div>
                </div>
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
