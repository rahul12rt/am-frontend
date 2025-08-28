"use client";

const PrivacyPolicy = () => {
  return (
    <div className="container mx-auto py-12 text-white pt-[70px]">
      <h1 className="text-3xl font-bold mb-6">PRIVACY POLICY</h1>
      <p className="text-[16px] text-gray-300 mb-8">Last Updated: 24/8/2025</p>

      <section className="mb-8">
        <h2 className="text-[18px] font-semibold mb-3">INTRODUCTION</h2>
        <p className="text-[16px]">
          At <span className="font-semibold">ALBAN MARCUS WATCHES PRIVATE LIMITED</span>, we respect your
          privacy and are committed to protecting your personal information. This Privacy Policy explains
          how we collect, use, disclose, and safeguard your information when you visit our website{" "}
          <span className="italic">albanmarcus.com</span> or make a purchase from us.
        </p>
        <p className="mt-2 text-[16px]">
          By using our website, you consent to the practices described in this Privacy Policy.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-[18px] font-semibold mb-3">INFORMATION WE COLLECT</h2>
        <p className="text-[16px]">We collect information you provide directly to us, such as:</p>
        <ul className="list-disc list-inside mt-2 space-y-1 text-[14px]">
          <li>Name, email address, phone number</li>
          <li>Billing and shipping addresses</li>
          <li>Payment information (processed securely by Razorpay)</li>
          <li>Account login credentials</li>
          <li>Order history and purchase preferences</li>
          <li>Communication preferences</li>
        </ul>

        <p className="mt-4 text-[16px]">We automatically collect certain information, including:</p>
        <ul className="list-disc list-inside mt-2 space-y-1 text-[14px]">
          <li>IP address and device information</li>
          <li>Browser type and operating system</li>
          <li>Pages visited and time spent on our website</li>
          <li>Referral sources and exit pages</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-[18px] font-semibold mb-3">HOW WE USE YOUR INFORMATION</h2>
        <ul className="list-disc list-inside space-y-1 text-[14px]">
          <li>Process and fulfill your orders</li>
          <li>Send order confirmations and shipping updates</li>
          <li>Provide customer support and respond to inquiries</li>
          <li>Improve our website and shopping experience</li>
          <li>Send promotional emails (with your consent)</li>
          <li>Comply with legal obligations</li>
          <li>Prevent fraud and ensure website security</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-[18px] font-semibold mb-3">INFORMATION SHARING</h2>
        <p className="text-[16px]">We may share your information with:</p>
        <ul className="list-disc list-inside mt-2 space-y-1 text-[14px]">
          <li>Razorpay (payment processing)</li>
          <li>Delhivery (shipping and delivery)</li>
          <li>Government authorities when legally required</li>
          <li>Service providers who assist in our operations</li>
        </ul>
        <p className="mt-2 text-[16px]">
          We do not sell, trade, or rent your personal information to third parties for marketing purposes.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-[18px] font-semibold mb-3">DATA SECURITY</h2>
        <p className="text-[16px]">
          We implement appropriate technical and organizational measures to protect your personal
          information against unauthorized access, alteration, disclosure, or destruction. However, no
          internet transmission is completely secure.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-[18px] font-semibold mb-3">COOKIES AND TRACKING</h2>
        <p className="text-[16px]">Our website uses cookies to:</p>
        <ul className="list-disc list-inside mt-2 space-y-1 text-[14px]">
          <li>Remember your preferences and login status</li>
          <li>Analyze website traffic and user behavior</li>
          <li>Improve website functionality</li>
          <li>Provide personalized content</li>
        </ul>
        <p className="mt-2 text-[16px]">
          You can disable cookies in your browser settings, though this may affect website functionality.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-[18px] font-semibold mb-3">YOUR RIGHTS</h2>
        <p className="text-[16px]">Under Indian data protection laws, you have the right to:</p>
        <ul className="list-disc list-inside mt-2 space-y-1 text-[14px]">
          <li>Access your personal information</li>
          <li>Correct inaccurate information</li>
          <li>Delete your personal information</li>
          <li>Withdraw consent for marketing communications</li>
          <li>Object to processing of your information</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-[18px] font-semibold mb-3">RETENTION OF INFORMATION</h2>
        <p className="text-[16px]">
          We retain your personal information for as long as necessary to provide our services and comply
          with legal obligations. Order information is typically retained for 7 years for accounting and tax
          purposes.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-[18px] font-semibold mb-3">CHILDREN&apos;S PRIVACY</h2>
        <p className="text-[16px]">
          Our services are not intended for individuals under 18 years of age. We do not knowingly collect
          personal information from children under 18.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-[18px] font-semibold mb-3">CHANGES TO PRIVACY POLICY</h2>
        <p className="text-[16px]">
          We may update this Privacy Policy periodically. Any changes will be posted on this page with an
          updated revision date.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="text-[18px] font-semibold mb-3">CONTACT US</h2>
        <p className="text-[16px]">If you have questions about this Privacy Policy or wish to exercise your rights, please contact us:</p>
        <p className="mt-2 text-[16px]">Email: <a href="mailto:contact@albanmarcus.com" className="text-blue-600 underline">contact@albanmarcus.com</a></p>
        <p className="text-[16px]">Address: BANGALORE, INDIA</p>
        <p className="mt-2 text-[16px]">
          This Privacy Policy is governed by Indian law and complies with the Information Technology Act,
          2000 and Information Technology Rules, 2011.
        </p>
      </section>
    </div>
  );
};

export default PrivacyPolicy;
