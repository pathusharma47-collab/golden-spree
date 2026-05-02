import LegalPageLayout from "@/components/LegalPageLayout";
import { Lock } from "lucide-react";

const PrivacyScreen = () => {
  return (
    <LegalPageLayout title="Privacy Policy" subtitle="How we collect, use and protect your data" icon={Lock}>
      <section>
        <h3>1. Information We Collect</h3>
        <ul>
          <li>Personal details such as your name, phone number and email address.</li>
          <li>KYC information including PAN, date of birth and identity documents.</li>
          <li>Transaction details related to your investments, redemptions and withdrawals.</li>
        </ul>
      </section>

      <section>
        <h3>2. How We Use Your Information</h3>
        <ul>
          <li>Account creation and management.</li>
          <li>Processing transactions and SIP installments.</li>
          <li>Communicating updates, alerts and promotional offers.</li>
          <li>Compliance with legal and regulatory obligations.</li>
        </ul>
      </section>

      <section>
        <h3>3. Data Sharing</h3>
        <p>Your information may be shared with:</p>
        <ul>
          <li>Payment gateway partners to process payments and payouts.</li>
          <li>KYC verification service providers.</li>
          <li>Logistics partners for home delivery of redeemed metal.</li>
        </ul>
      </section>

      <section>
        <h3>4. Security</h3>
        <ul>
          <li>We use encryption to protect data in transit and at rest.</li>
          <li>Sensitive information is stored on secure, access-controlled systems.</li>
        </ul>
      </section>

      <section>
        <h3>5. Your Rights</h3>
        <ul>
          <li>You can access, update or request deletion of your personal information, subject to applicable law and regulatory record-keeping requirements.</li>
        </ul>
      </section>

      <section>
        <h3>6. Updates to this Policy</h3>
        <ul>
          <li>We may update this Privacy Policy from time to time. Continued use of the app indicates acceptance of the updated policy.</li>
        </ul>
      </section>
    </LegalPageLayout>
  );
};

export default PrivacyScreen;