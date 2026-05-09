'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function AboutPage() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-[#0d1117]" style={{ fontFamily: 'Inter, -apple-system, sans-serif' }}>
      {/* Background glows */}
      <div className="fixed top-0 left-0 w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(138,43,226,0.12)_0%,transparent_70%)] pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(77,124,254,0.12)_0%,transparent_70%)] pointer-events-none" />

      <div className="relative z-10">
        {/* Header with Back Button */}
        <div className="sticky top-0 z-50 bg-[#0d1117] backdrop-blur-sm border-b border-[#21262d] h-[52px] flex items-center px-4 gap-3">
          <Link
            href="/"
            className="text-[24px] text-[#58a6ff] hover:text-[#79c0ff] transition-colors"
          >
            ←
          </Link>
          <h1 className="text-[16px] font-semibold text-white">About SwapEase</h1>
        </div>

        {/* Main Content */}
        <div className="px-4 py-6 pb-20">
          {/* Hero Section */}
          <section className="mb-8">
            <h2 className="text-[24px] font-bold text-white mb-3">What is SwapEase?</h2>
            <p className="text-[14px] text-[#c9d1d9] leading-relaxed">
              SwapEase is a peer-to-peer (P2P) cryptocurrency trading platform that connects buyers and sellers directly, enabling secure and efficient USDT trading in INR without intermediaries or hidden fees.
            </p>
          </section>

          {/* How It Works */}
          <section className="mb-8">
            <h2 className="text-[20px] font-bold text-white mb-4">How It Works</h2>
            
            {/* Step 1 */}
            <div className="mb-6 bg-[#161b22] border border-[#21262d] rounded-[12px] p-4">
              <div className="flex gap-3 mb-2">
                <div className="w-8 h-8 bg-[#4d7cfe] rounded-full flex items-center justify-center text-white text-[13px] font-bold flex-shrink-0">1</div>
                <h3 className="text-[15px] font-semibold text-white pt-0.5">Create Account</h3>
              </div>
              <p className="text-[13px] text-[#8b949e] ml-11">
                Sign up with your email or phone number. Complete basic KYC verification (Email, SMS, and optional document verification) to unlock all features.
              </p>
            </div>

            {/* Step 2 */}
            <div className="mb-6 bg-[#161b22] border border-[#21262d] rounded-[12px] p-4">
              <div className="flex gap-3 mb-2">
                <div className="w-8 h-8 bg-[#4d7cfe] rounded-full flex items-center justify-center text-white text-[13px] font-bold flex-shrink-0">2</div>
                <h3 className="text-[15px] font-semibold text-white pt-0.5">Browse Offers</h3>
              </div>
              <p className="text-[13px] text-[#8b949e] ml-11">
                Explore active buy and sell offers from verified traders. Filter by payment method (UPI, Bank Transfer, IMPS), price, and limits that match your needs.
              </p>
            </div>

            {/* Step 3 */}
            <div className="mb-6 bg-[#161b22] border border-[#21262d] rounded-[12px] p-4">
              <div className="flex gap-3 mb-2">
                <div className="w-8 h-8 bg-[#4d7cfe] rounded-full flex items-center justify-center text-white text-[13px] font-bold flex-shrink-0">3</div>
                <h3 className="text-[15px] font-semibold text-white pt-0.5">Place Order</h3>
              </div>
              <p className="text-[13px] text-[#8b949e] ml-11">
                Click on an offer and place your order. Specify the amount you want to buy/sell within the seller's minimum and maximum limits.
              </p>
            </div>

            {/* Step 4 */}
            <div className="mb-6 bg-[#161b22] border border-[#21262d] rounded-[12px] p-4">
              <div className="flex gap-3 mb-2">
                <div className="w-8 h-8 bg-[#4d7cfe] rounded-full flex items-center justify-center text-white text-[13px] font-bold flex-shrink-0">4</div>
                <h3 className="text-[15px] font-semibold text-white pt-0.5">Complete Payment</h3>
              </div>
              <p className="text-[13px] text-[#8b949e] ml-11">
                Transfer the agreed amount using the seller's payment method (bank account, UPI ID, or other). Share payment proof in the chat.
              </p>
            </div>

            {/* Step 5 */}
            <div className="bg-[#161b22] border border-[#21262d] rounded-[12px] p-4">
              <div className="flex gap-3 mb-2">
                <div className="w-8 h-8 bg-[#4d7cfe] rounded-full flex items-center justify-center text-white text-[13px] font-bold flex-shrink-0">5</div>
                <h3 className="text-[15px] font-semibold text-white pt-0.5">Receive Crypto</h3>
              </div>
              <p className="text-[13px] text-[#8b949e] ml-11">
                Once the seller verifies your payment, USDT is transferred to your wallet. Release confirmed - transaction complete!
              </p>
            </div>
          </section>

          {/* Key Features */}
          <section className="mb-8">
            <h2 className="text-[20px] font-bold text-white mb-4">Key Features</h2>
            
            <div className="space-y-3">
              <div className="bg-[#161b22] border border-[#21262d] rounded-[12px] p-3">
                <h4 className="text-[14px] font-semibold text-white mb-1">Direct Peer-to-Peer Trading</h4>
                <p className="text-[12px] text-[#8b949e]">Trade directly with other users without intermediaries. You control your funds throughout the entire process.</p>
              </div>

              <div className="bg-[#161b22] border border-[#21262d] rounded-[12px] p-3">
                <h4 className="text-[14px] font-semibold text-white mb-1">Verified Traders</h4>
                <p className="text-[12px] text-[#8b949e]">All traders are KYC verified. View completion rates, response times, and ratings from previous transactions.</p>
              </div>

              <div className="bg-[#161b22] border border-[#21262d] rounded-[12px] p-3">
                <h4 className="text-[14px] font-semibold text-white mb-1">Flexible Payment Methods</h4>
                <p className="text-[12px] text-[#8b949e]">Choose from multiple payment options: UPI, bank transfers, IMPS, and more. Traders set their preferred methods.</p>
              </div>

              <div className="bg-[#161b22] border border-[#21262d] rounded-[12px] p-3">
                <h4 className="text-[14px] font-semibold text-white mb-1">Secure Escrow System</h4>
                <p className="text-[12px] text-[#8b949e]">Funds are held in escrow until both parties confirm the transaction. Protects both buyers and sellers.</p>
              </div>

              <div className="bg-[#161b22] border border-[#21262d] rounded-[12px] p-3">
                <h4 className="text-[14px] font-semibold text-white mb-1">Real-time Chat</h4>
                <p className="text-[12px] text-[#8b949e]">Communicate directly with traders in real-time. Discuss terms, share payment proofs, and resolve any questions instantly.</p>
              </div>

              <div className="bg-[#161b22] border border-[#21262d] rounded-[12px] p-3">
                <h4 className="text-[14px] font-semibold text-white mb-1">Instant Notifications</h4>
                <p className="text-[12px] text-[#8b949e]">Get notified immediately when orders are placed, payments received, or disputes need attention.</p>
              </div>
            </div>
          </section>

          {/* Why Choose SwapEase */}
          <section className="mb-8">
            <h2 className="text-[20px] font-bold text-white mb-4">Why Choose SwapEase?</h2>
            
            <div className="space-y-2 text-[13px] text-[#c9d1d9]">
              <div className="flex gap-3">
                <span className="text-[#0ecb81] text-[16px] mt-0.5">✓</span>
                <p><strong>Zero Platform Fees</strong> - No hidden charges. Pay only what you negotiate directly with sellers.</p>
              </div>
              <div className="flex gap-3">
                <span className="text-[#0ecb81] text-[16px] mt-0.5">✓</span>
                <p><strong>Non-Custodial</strong> - You maintain control of your private keys and funds. We never hold your cryptocurrencies.</p>
              </div>
              <div className="flex gap-3">
                <span className="text-[#0ecb81] text-[16px] mt-0.5">✓</span>
                <p><strong>Community Driven</strong> - Trading with real people, not algorithms. Build reputation and earn trader badges.</p>
              </div>
              <div className="flex gap-3">
                <span className="text-[#0ecb81] text-[16px] mt-0.5">✓</span>
                <p><strong>24/7 Trading</strong> - Trade anytime, anywhere. No market hours restrictions. Worldwide liquidity.</p>
              </div>
              <div className="flex gap-3">
                <span className="text-[#0ecb81] text-[16px] mt-0.5">✓</span>
                <p><strong>Transparent Pricing</strong> - Real market rates. See live prices, market spreads, and trader ratings instantly.</p>
              </div>
            </div>
          </section>

          {/* Safety & Security */}
          <section className="mb-8">
            <h2 className="text-[20px] font-bold text-white mb-4">Safety & Security</h2>
            
            <div className="space-y-3">
              <div className="bg-[#161b22] border border-[#21262d] rounded-[12px] p-3">
                <h4 className="text-[14px] font-semibold text-white mb-1">🔐 KYC Verification</h4>
                <p className="text-[12px] text-[#8b949e]">All traders complete identity verification including email, SMS, and optional document verification to ensure legitimacy.</p>
              </div>

              <div className="bg-[#161b22] border border-[#21262d] rounded-[12px] p-3">
                <h4 className="text-[14px] font-semibold text-white mb-1">⚠️ Dispute Resolution</h4>
                <p className="text-[12px] text-[#8b949e]">Fair dispute handling process. If there's an issue, both parties can open a dispute for review and resolution.</p>
              </div>

              <div className="bg-[#161b22] border border-[#21262d] rounded-[12px] p-3">
                <h4 className="text-[14px] font-semibold text-white mb-1">⭐ Trader Ratings</h4>
                <p className="text-[12px] text-[#8b949e]">Review trader history, completion rates, and customer feedback before trading. Badges show verified traders.</p>
              </div>

              <div className="bg-[#161b22] border border-[#21262d] rounded-[12px] p-3">
                <h4 className="text-[14px] font-semibold text-white mb-1">📝 Order Tracking</h4>
                <p className="text-[12px] text-[#8b949e]">Every trade is tracked and timestamped. Chat history and transaction proof available for your records.</p>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="mb-8">
            <h2 className="text-[20px] font-bold text-white mb-4">Frequently Asked Questions</h2>
            
            <div className="space-y-2">
              {[
                {
                  q: "Is SwapEase safe to use?",
                  a: "Yes. We use escrow systems, KYC verification, trader ratings, and dispute resolution. Your funds are protected throughout the transaction."
                },
                {
                  q: "Do I need to verify my identity?",
                  a: "Yes, KYC verification is required. Start with email and SMS verification, then optionally provide documents for enhanced trading limits."
                },
                {
                  q: "What payment methods are accepted?",
                  a: "Traders accept various methods: UPI, Bank Transfers, IMPS, and others. Check individual trader offers for available payment options."
                },
                {
                  q: "Are there any trading fees?",
                  a: "No platform fees. You negotiate rates directly with traders. Only pay for the crypto amount you agreed upon."
                },
                {
                  q: "How long do trades take?",
                  a: "Typically 5-30 minutes depending on the payment method and trader response time. Instant for UPI, standard for bank transfers."
                },
                {
                  q: "What if I have a problem with a trade?",
                  a: "Open a dispute within 24 hours. Our team reviews chat history and transaction details to provide fair resolution."
                },
                {
                  q: "Can I withdraw my crypto to other wallets?",
                  a: "Yes. You can transfer received USDT to any Ethereum, Polygon, or Tron wallet. You control your private keys."
                },
                {
                  q: "Is my data private?",
                  a: "Your personal data is encrypted and secure. We never share your information with third parties without consent."
                }
              ].map((faq, idx) => (
                <div key={idx} className="bg-[#161b22] border border-[#21262d] rounded-[12px] overflow-hidden">
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                    className="w-full flex items-center justify-between p-4 hover:bg-[#0f1419] transition-colors"
                  >
                    <span className="text-[14px] font-semibold text-white text-left">{faq.q}</span>
                    <span className="text-[18px] text-[#8b949e]">{expandedFaq === idx ? '−' : '+'}</span>
                  </button>
                  {expandedFaq === idx && (
                    <div className="px-4 pb-4 pt-0 border-t border-[#21262d]">
                      <p className="text-[13px] text-[#c9d1d9] leading-relaxed">{faq.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="mb-8 text-center">
            <h2 className="text-[20px] font-bold text-white mb-3">Ready to Start Trading?</h2>
            <p className="text-[13px] text-[#8b949e] mb-4">Join thousands of traders and start your P2P crypto journey today.</p>
            <Link
              href="/register"
              className="inline-block h-12 px-6 bg-[#4d7cfe] text-white text-[15px] font-semibold rounded-full hover:shadow-[0_8px_16px_rgba(77,124,254,0.4)] hover:bg-[#5d8cff] transition-all duration-300 active:scale-95"
            >
              Get Started Now 🚀
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}
