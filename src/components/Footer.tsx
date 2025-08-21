import Link from 'next/link';
import Image from 'next/image';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer>
        <div className="footer-sections">
            <div className="foot-sec">
                <h4 className="footsec-title">About</h4>
                <img src="/assets/img/logo.png" />
                <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry&apos;s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.</p>
            </div>
            <div className="foot-sec">
                <h4 className="footsec-title">Features</h4>
                <ul>
                    <li><Link href="/">Home</Link></li>
                    <li><a href="/matches">Matches</a></li>
                    <li><a href="/leaderboard">Leaderboard</a></li>
                    <li><a href="/profile">Profile</a></li>
                    <li><a href="/tokens">Tokens</a></li>
                </ul>    
            </div>
            <div className="foot-sec">
                <h4 className="footsec-title">Support</h4>
                <ul>
                    <li><a href="https://discord.gg/JtmxFYAw7W" target="_blank">Create a Ticket <i className="fas fa-external-link-alt"></i></a></li>
                    <li><a href="#">Terms of Services</a></li>
                    <li><a href="#">Privacy Policy</a></li>
                    <li><a href="#">FAQ</a></li>
                </ul>    
            </div>
            <div className="foot-sec">
                <h4 className="footsec-title">Contact Us</h4>
                <ul>
                    <li><a href="#" target="_blank">Twitter <i className="fas fa-external-link-alt"></i></a></li>
                    <li><a href="#" target="_blank">Discord <i className="fas fa-external-link-alt"></i></a></li>
                </ul>
                <h4 className="footsec-title email">Email Us</h4>
                <ul className="email">
                    <li>For Inquiries : <br/><a href="mailto:contact@lookingforcoins.gg" target="_blank">contact@lookingforcoins.gg</a></li>
                    <li>For Sponsors & Partnerships : <br/><a href="mailto:sponsors@lookingforcoins.gg" target="_blank">sponsors@lookingforcoins.gg</a></li>
                    <li>For Bugs reporting : <br/><a href="mailto:webdev@lookingforcoins.gg" target="_blank">webdev@lookingforcoins.gg </a></li>
                </ul>
            </div>
        </div>
        <div className="copyright">
            <div className="left-copy">
                <p>Looking For Coins {currentYear} © All Rights Reserved </p>
            </div>
            <div className="right-copy">
                <p>Designed by <a href="#" target="_blank">VeNomX</a></p>
            </div>
        </div>
    </footer>
  );
};

export default Footer;
