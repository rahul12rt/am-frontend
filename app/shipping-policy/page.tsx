"use client";

const ShippingPolicy = () => {
  return (
    <div className="container mx-auto py-12 text-white pt-[70px] px-4">
      <h1 className="text-3xl font-bold mb-6">SHIPPING POLICY</h1>
      <p className="text-[16px] text-gray-300 mb-8">Last Updated: 01/10/2025</p>

      <section className="mb-8">
        <h2 className="text-[18px] font-semibold mb-3">SHIPPING AREAS</h2>
        <p className="text-[16px] mb-4">
          We deliver across India to the following locations:
        </p>
        <ul className="list-disc list-inside space-y-1 text-[14px] ml-4">
          <li><strong>Metro Cities:</strong> Delhi, Mumbai, Bangalore, Chennai, Kolkata, Hyderabad</li>
          <li><strong>Tier 1 Cities:</strong> Pune, Ahmedabad, Jaipur, Lucknow, Kanpur, Nagpur</li>
          <li><strong>Tier 2 & 3 Cities:</strong> Most locations covered</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-[18px] font-semibold mb-3">DELIVERY TIMEFRAMES</h2>
        <ul className="list-disc list-inside space-y-1 text-[14px] ml-4">
          <li><strong>Metro Cities:</strong> 2-3 business days</li>
          <li><strong>Tier 1 Cities:</strong> 3-5 business days</li>
          <li><strong>Tier 2/3 Cities:</strong> 5-7 business days</li>
          <li><strong>Remote locations:</strong> 7-10 business days</li>
        </ul>
        <div className="mt-4 p-4 bg-gray-800 rounded-lg border-l-4 border-yellow-500">
          <p className="text-[14px] text-yellow-200">
            <strong>Reserved or pre-ordered/limited batch products may take longer to ship.</strong> 
            Reserved ALBAN MARCUS timepieces are crafted in limited batches and may require additional time for delivery. 
            This makes the wait feel exclusive, not like a delay.
          </p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-[18px] font-semibold mb-3">SHIPPING CHARGES</h2>
        <div className="p-4 bg-green-900 rounded-lg border-l-4 border-green-500 mb-4">
          <p className="text-[16px] text-green-200 font-semibold">
            All orders include free, fully insured shipping with tracking.
          </p>
        </div>
        <p className="text-[14px] text-gray-300">
          Reserved/limited batch models may take up to 30-40 days for delivery.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-[18px] font-semibold mb-3">ORDER PROCESSING</h2>
        <ul className="list-disc list-inside space-y-1 text-[14px] ml-4">
          <li>Orders placed before 2 PM are processed same day</li>
          <li>Orders placed after 2 PM are processed next business day</li>
          <li>Orders placed on weekends processed on Monday</li>
          <li>No processing on public holidays</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-[18px] font-semibold mb-3">PACKAGING</h2>
        <ul className="list-disc list-inside space-y-1 text-[14px] ml-4">
          <li>All watches shipped in secure, branded packaging</li>
          <li>Bubble wrap and protective material included</li>
          <li>Signature required upon delivery</li>
          <li>All shipments insured against loss/damage</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-[18px] font-semibold mb-3">DELIVERY ISSUES</h2>
        <ul className="list-disc list-inside space-y-1 text-[14px] ml-4">
          <li>Track your order using the tracking number provided</li>
          <li>Contact us immediately for delivery issues</li>
          <li>Undelivered packages returned to us after 7 days</li>
          <li>Reshipment charges apply for failed deliveries due to incorrect address</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-[18px] font-semibold mb-3">INTERNATIONAL SHIPPING</h2>
        <p className="text-[16px] mb-4">
          We are currently focused on serving customers across India and are working towards expanding our international shipping capabilities. 
          We plan to offer worldwide shipping in the near future to bring our authentic watch collection to customers globally.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-[18px] font-semibold mb-3">CONTACT FOR SHIPPING QUERIES</h2>
        <div className="p-4 bg-blue-900 rounded-lg border-l-4 border-blue-500">
          <p className="text-[16px] text-blue-200">
            <strong>Email:</strong> <a href="mailto:contact@albanmarcus.com" className="underline hover:text-blue-100">contact@albanmarcus.com</a>
          </p>
        </div>
      </section>

      <div className="mt-12 pt-8 border-t border-gray-700">
        <p className="text-[14px] text-gray-400 text-center">
          This shipping policy is effective as of the date listed above and may be updated from time to time. 
          Please check this page periodically for any changes.
        </p>
      </div>
    </div>
  );
};

export default ShippingPolicy;
