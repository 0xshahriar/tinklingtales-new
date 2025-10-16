import { APP_CONFIG } from "../../js/constants.js";
import { getIcon } from "../../js/icons.js";

const currentYear = new Date().getFullYear();

export function renderFooter() {
  return `
    <footer class="footer">
      <div class="container">
        <div class="footer__grid">
          <div>
            <div class="footer__brand">${APP_CONFIG.siteName}</div>
            <p>Handcrafted bangles that tell your story. Custom made and premade stacks delivered worldwide.</p>
            <div class="footer__social" aria-label="Social media">
              <a href="${APP_CONFIG.social.facebook}" target="_blank" rel="noopener" aria-label="Facebook">
                <span class="icon" aria-hidden="true">${getIcon("facebook")}</span>
              </a>
              <a href="${APP_CONFIG.social.instagram}" target="_blank" rel="noopener" aria-label="Instagram">
                <span class="icon" aria-hidden="true">${getIcon("instagram")}</span>
              </a>
              <a href="${APP_CONFIG.social.messenger}" target="_blank" rel="noopener" aria-label="Messenger">
                <span class="icon" aria-hidden="true">${getIcon("messenger")}</span>
              </a>
            </div>
          </div>
          <div>
            <h4>Shop</h4>
            <ul>
              <li><a href="shop.html">All Products</a></li>
              <li><a href="custom.html">Custom Orders</a></li>
              <li><a href="blog.html">Blog</a></li>
              <li><a href="about.html#faq">FAQs</a></li>
              <li><a href="policies.html">Policies</a></li>
            </ul>
          </div>
          <div>
            <h4>Support</h4>
            <ul>
              <li><a href="mailto:${APP_CONFIG.contactEmail}">Email</a></li>
              <li><a href="about.html#contact">Contact</a></li>
              <li><a href="shipping.html">Shipping</a></li>
              <li><a href="returns.html">Returns</a></li>
            </ul>
          </div>
        </div>
        <div class="footer__bottom">
          <span>© ${currentYear} ${APP_CONFIG.siteName}. All rights reserved.</span>
          <span><a href="privacy.html">Privacy Policy</a> · <a href="terms.html">Terms & Conditions</a></span>
        </div>
      </div>
    </footer>
  `;
}
