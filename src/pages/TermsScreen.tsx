import LegalPageLayout from "@/components/LegalPageLayout";

const Section = ({ n, title, children }: { n: number; title: string; children: React.ReactNode }) => (
  <section>
    <h3>{n}. {title}</h3>
    {children}
  </section>
);

const TermsScreen = () => {
  return (
    <LegalPageLayout title="Terms & Conditions" subtitle="Last updated: April 2026">
      <p>
        These Terms & Conditions ("Terms") govern your use of the Maheshwari Alankar
        application and services. Please read them carefully before using the app.
      </p>

      <Section n={1} title="Acceptance of Terms">
        <ul>
          <li>By using the Maheshwari Alankar app, you agree to be legally bound by these Terms.</li>
          <li>If you do not agree with any part of these Terms, you must not use the app.</li>
        </ul>
      </Section>

      <Section n={2} title="Nature of Services">
        <ul>
          <li>Invest in digital gold and silver.</li>
          <li>Participate in Systematic Investment Plans (SIPs).</li>
          <li>Access promotional features such as Spin & Win, rewards and referrals.</li>
          <li>All investments are stored as grams of metal, not as money.</li>
        </ul>
      </Section>

      <Section n={3} title="Pricing & Conversion">
        <ul>
          <li>Buy and sell prices are based on live market rates at the time of transaction.</li>
          <li>The price is locked once a transaction is confirmed.</li>
          <li>Grammage is credited to your account based on the locked price.</li>
          <li>3% GST and applicable transaction charges apply on every purchase.</li>
          <li>The final grams credited reflect the amount after all deductions.</li>
        </ul>
      </Section>

      <Section n={4} title="Storage & Ownership">
        <ul>
          <li>All digital gold and silver purchased is fully backed by physical metal.</li>
          <li>Physical storage is managed by us internally or through trusted third-party vault partners.</li>
        </ul>
      </Section>

      <Section n={5} title="Redemption Policy">
        <ul>
          <li>You must redeem your accumulated metal within 333 days of purchase.</li>
          <li>Redemption options include:
            <ul>
              <li>Offline showroom pickup</li>
              <li>Online home delivery</li>
            </ul>
          </li>
        </ul>
      </Section>

      <Section n={6} title="Delivery Terms">
        <ul>
          <li>Delivery charges are calculated based on your location.</li>
          <li>Availability of products may affect order processing.</li>
          <li>Delivery timelines may vary due to customization or logistics.</li>
          <li>We are not liable for delays caused by courier or shipping partners.</li>
        </ul>
      </Section>

      <Section n={7} title="Charges on Redemption">
        <ul>
          <li>Making charges on jewellery items.</li>
          <li>Wastage charges where applicable.</li>
          <li>Applicable government taxes.</li>
          <li>All charges will be displayed transparently before you confirm redemption.</li>
        </ul>
      </Section>

      <Section n={8} title="Sell Option (Liquidation)">
        <ul>
          <li>You may sell your holdings partially or fully at any time.</li>
          <li>Sell value is calculated using the live buy-back rate.</li>
          <li>Sale proceeds are first credited to your in-app wallet.</li>
          <li>You can then withdraw to your linked bank account.</li>
          <li>Bank settlement typically takes 2–5 working days.</li>
        </ul>
      </Section>

      <Section n={9} title="Wallet & Withdrawals">
        <ul>
          <li>Your wallet is non-interest bearing.</li>
          <li>Withdrawals require valid bank account details.</li>
          <li>KYC verification may be required before withdrawal.</li>
          <li>Suspicious activity may result in delayed or rejected withdrawals.</li>
        </ul>
      </Section>

      <Section n={10} title="SIP Rules">
        <ul>
          <li>You must pay all monthly installments as per the chosen plan.</li>
          <li>SIP benefits and bonus rewards are credited only after successful completion of all installments.</li>
          <li>Missed payments may result in reduced benefits or termination of the SIP.</li>
        </ul>
      </Section>

      <Section n={11} title="Rewards, Spin & Offers">
        <ul>
          <li>Rewards, Spin & Win and similar offers are promotional features.</li>
          <li>All rewards are non-transferable.</li>
          <li>Rewards cannot be exchanged for cash unless explicitly specified.</li>
          <li>The company reserves the right to modify or remove these features at any time.</li>
        </ul>
      </Section>

      <Section n={12} title="Transaction Charges">
        <ul>
          <li>Charges may apply on investments, redemptions and withdrawals.</li>
          <li>All applicable charges will be displayed before you confirm any transaction.</li>
        </ul>
      </Section>

      <Section n={13} title="KYC & Compliance">
        <ul>
          <li>KYC is required for high-value transactions and withdrawals.</li>
          <li>Non-compliance with KYC requirements may lead to restrictions on your account.</li>
        </ul>
      </Section>

      <Section n={14} title="Risk Disclosure">
        <ul>
          <li>Gold and silver prices fluctuate based on market conditions.</li>
          <li>There are no guaranteed returns on any investment made through the app.</li>
        </ul>
      </Section>

      <Section n={15} title="Cancellation & Refund">
        <ul>
          <li>Once an amount is converted to gold or silver, the transaction cannot be cancelled.</li>
          <li>For liquidity, please use the sell or redeem options.</li>
        </ul>
      </Section>

      <Section n={16} title="Prohibited Activities">
        <ul>
          <li>Fraudulent transactions are strictly prohibited.</li>
          <li>Misuse of referral or reward systems is not allowed.</li>
          <li>Any unlawful usage of the platform is forbidden.</li>
          <li>Violations may result in account suspension or legal action.</li>
        </ul>
      </Section>

      <Section n={17} title="Limitation of Liability">
        <p>We shall not be liable for losses arising from:</p>
        <ul>
          <li>Market fluctuations and investment losses.</li>
          <li>Technical failures or service interruptions.</li>
          <li>Payment gateway issues.</li>
          <li>Delivery delays caused by third parties.</li>
        </ul>
      </Section>

      <Section n={18} title="Force Majeure">
        <p>We are not responsible for failure to perform our obligations due to:</p>
        <ul>
          <li>Natural disasters.</li>
          <li>Government actions or regulations.</li>
          <li>Network or system failures.</li>
        </ul>
      </Section>

      <Section n={19} title="Modification of Terms">
        <ul>
          <li>We may update these Terms at any time without prior notice.</li>
          <li>Continued use of the app constitutes acceptance of the updated Terms.</li>
        </ul>
      </Section>

      <Section n={20} title="Governing Law">
        <ul>
          <li>These Terms are governed by the laws of India.</li>
          <li>All disputes shall be subject to the exclusive jurisdiction of courts in Coimbatore, Tamil Nadu.</li>
        </ul>
      </Section>
    </LegalPageLayout>
  );
};

export default TermsScreen;