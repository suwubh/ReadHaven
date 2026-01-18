interface FooterLinkProps {
  href: string;
  children: React.ReactNode;
}

function FooterLink({ href, children }: FooterLinkProps) {
  return (
    <li>
      <a href={href}>{children}</a>
    </li>
  );
}

export default function Footer() {
  return (
    <footer className="footer-section">
      <div className="footer-container">
        <div className="footer-column">
          <h4>ABOUT</h4>
          <ul>
            <FooterLink href="#">About Us</FooterLink>
            <FooterLink href="#">Careers</FooterLink>
            <FooterLink href="#">Authors & ads blog</FooterLink>
            <FooterLink href="#">API</FooterLink>
          </ul>
        </div>

        <div className="footer-column">
          <h4>CONNECT</h4>
          <ul className="social-icons">
            <li>
              <a href="#" aria-label="Facebook">
                <i className="fab fa-facebook-f"></i>
              </a>
            </li>
            <li>
              <a href="#" aria-label="Twitter">
                <i className="fab fa-twitter"></i>
              </a>
            </li>
            <li>
              <a href="#" aria-label="Instagram">
                <i className="fab fa-instagram"></i>
              </a>
            </li>
            <li>
              <a href="#" aria-label="LinkedIn">
                <i className="fab fa-linkedin-in"></i>
              </a>
            </li>
          </ul>
        </div>

        <div className="footer-column">
          <ul className="app-buttons">
            <li>
              <a href="#">
                <img src="/images/appstore.png" alt="Download on App Store" />
              </a>
            </li>
            <li>
              <a href="#">
                <img src="/images/googleplay.png" alt="Get it on Google Play" />
              </a>
            </li>
          </ul>
          <p>
            &copy; 2024 ReadHaven, Inc. <br />
            Mobile version
          </p>
        </div>
      </div>
    </footer>
  );
}