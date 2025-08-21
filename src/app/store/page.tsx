
import Image from "next/image";
import Header from "@/components/Header";

export default function Store() {
  return (
    <>
      <Header 
        showVideoBackground={false}
        title="Store"
        subtitle="Coming Soon"
        description="Get ready for exclusive items, skins, and more!"
        icon="fas fa-store"
      />
      
      <div className="content">
        <section className="store">
          <div className="container">
            <div className="coming-soon">
              <div className="coming-soon-content">
                <Image src="/assets/img/logo.png" alt="LFC Logo" width={120} height={120} />
                <h2>Store Coming Soon!</h2>
                <p>We&apos;re working hard to bring you an amazing store experience with exclusive items, cosmetics, and more.</p>
                <div className="notify-me">
                  <input type="email" placeholder="Enter your email to get notified" />
                  <button>Notify Me</button>
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
