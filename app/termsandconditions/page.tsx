"use client";

const Termsandconditions = () => {
  return (
    <div className="container mx-auto py-12 text-white pt-[70px]">
      <h1 className="text-3xl font-bold mb-6">TERMS & CONDITIONS</h1>
      <p className="text-[16px] text-gray-300 mb-8">Last Updated: 01/10/2025</p>

      {/* Acceptance of Terms */}
      <section className="mb-8">
        <h2 className="text-[18px] font-semibold mb-3">ACCEPTANCE OF TERMS</h2>
        <p className="text-[16px]">
          By accessing and using <span className="italic">albanmarcus.com</span>, you
          accept and agree to be bound by the terms and provisions of this
          agreement.
        </p>
      </section>

      {/* Products and Services */}
      <section className="mb-8">
        <h2 className="text-[18px] font-semibold mb-3">PRODUCTS AND SERVICES</h2>
        <ul className="list-disc list-inside space-y-1 text-[14px]">
          <li>All watches sold are 100% authentic and genuine</li>
          <li>Product images are for representation purposes only</li>
          <li>Prices are in Indian Rupees (INR) and include applicable taxes</li>
          <li>We reserve the right to modify prices without prior notice</li>
          <li>Product availability is subject to stock</li>
        </ul>
      </section>

      {/* Account Registration */}
      <section className="mb-8">
        <h2 className="text-[18px] font-semibold mb-3">ACCOUNT REGISTRATION</h2>
        <ul className="list-disc list-inside space-y-1 text-[14px]">
          <li>You must provide accurate and complete information</li>
          <li>You are responsible for maintaining account security</li>
          <li>One account per person/email address</li>
          <li>We reserve the right to suspend/terminate accounts</li>
        </ul>
      </section>

      {/* Orders and Payments */}
      <section className="mb-8">
        <h2 className="text-[18px] font-semibold mb-3">ORDERS AND PAYMENTS</h2>
        <ul className="list-disc list-inside space-y-1 text-[14px]">
          <li>Orders are subject to acceptance and product availability</li>
          <li>Payment must be completed before order processing</li>
          <li>We use Razorpay for secure payment processing</li>
          <li>EMI options available on eligible orders</li>
          <li>Order confirmation sent via email/SMS</li>
        </ul>
      </section>

      {/* Warranties */}
      <section className="mb-8">
        <h2 className="text-[18px] font-semibold mb-3">WARRANTIES</h2>
        <ul className="list-disc list-inside space-y-1 text-[14px]">
          <li>Manufacturer warranty: 2 years from purchase date</li>
          <li>Warranty covers manufacturing defects only</li>
          <li>Water resistance as per manufacturer specifications</li>
          <li>Warranty void if product is tampered with or damaged</li>
        </ul>
      </section>

      {/* Limitation of Liability */}
      <section className="mb-8">
        <h2 className="text-[18px] font-semibold mb-3">LIMITATION OF LIABILITY</h2>
        <ul className="list-disc list-inside space-y-1 text-[14px]">
          <li>Our liability is limited to the purchase price of the product</li>
          <li>We are not liable for indirect, incidental, or consequential damages</li>
          <li>Force majeure events beyond our control are excluded</li>
        </ul>
      </section>

      {/* Governing Law */}
      <section className="mb-8">
        <h2 className="text-[18px] font-semibold mb-3">GOVERNING LAW</h2>
        <p className="text-[16px]">
          These terms are governed by Indian law and subject to jurisdiction of{" "}
          <span className="italic">[CITY]</span> courts.
        </p>
      </section>

      {/* Contact Information */}
      <section>
        <h2 className="text-[18px] font-semibold mb-3">CONTACT INFORMATION</h2>
        <p className="text-[16px]">For questions regarding these terms:</p>
        <p className="mt-2 text-[16px]">
          Email:{" "}
          <a
            href="mailto:contact@albanmarcus.com"
            className="text-blue-600 underline"
          >
            contact@albanmarcus.com
          </a>
        </p>
        <p className="text-[16px]">Address: BANGALORE, INDIA</p>
      </section>
    </div>
  );
};

export default Termsandconditions;
