import LegalPageLayout from "@/components/LegalPageLayout";

const RefundScreen = () => {
  return (
    <LegalPageLayout title="Refund Policy" subtitle="Rules for refunds and cancellations">
      <section>
        <h3>1. Conversion to Gold / Silver</h3>
        <ul>
          <li>No refund is provided once your money has been converted to digital gold or silver.</li>
        </ul>
      </section>

      <section>
        <h3>2. Failed Transactions</h3>
        <ul>
          <li>If a transaction fails and your money is debited, the amount will be refunded to the original payment method within 5–7 working days.</li>
        </ul>
      </section>

      <section>
        <h3>3. SIP Payments</h3>
        <ul>
          <li>SIP installment payments are non-refundable once successfully credited.</li>
        </ul>
      </section>

      <section>
        <h3>4. Liquidity</h3>
        <ul>
          <li>To convert your holdings back to money, please use the sell or redeem options available in the app.</li>
        </ul>
      </section>
    </LegalPageLayout>
  );
};

export default RefundScreen;