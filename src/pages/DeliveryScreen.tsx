import LegalPageLayout from "@/components/LegalPageLayout";

const DeliveryScreen = () => {
  return (
    <LegalPageLayout title="Delivery Policy" subtitle="Pickup and home delivery terms">
      <section>
        <h3>1. Delivery Options</h3>
        <ul>
          <li>Showroom pickup at our authorized stores.</li>
          <li>Home delivery to your registered address.</li>
        </ul>
      </section>

      <section>
        <h3>2. Charges</h3>
        <ul>
          <li>Delivery charges are calculated based on your delivery location.</li>
          <li>Applicable taxes and making charges (where relevant) are displayed before checkout.</li>
        </ul>
      </section>

      <section>
        <h3>3. Timelines</h3>
        <ul>
          <li>Delivery timelines may vary depending on product availability, customization and logistics.</li>
        </ul>
      </section>

      <section>
        <h3>4. Courier Liability</h3>
        <ul>
          <li>We are not liable for delays caused by courier or shipping partners once the package has been handed over for delivery.</li>
        </ul>
      </section>
    </LegalPageLayout>
  );
};

export default DeliveryScreen;