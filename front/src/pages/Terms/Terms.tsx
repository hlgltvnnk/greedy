import React from 'react';
import { PageHeader } from '../../components';

const Terms: React.FC = () => {
  return (
    <div className="distribution-page flex flex-col items-center justify-start w-full h-full gap-4 px-4 lg:px-0  overflow-y-auto">
      <PageHeader />
      <div className="paper flex flex-col gap-6  w-full text-white">
        <h2 className="font-bold text-lg">Last updated: 05.14.2025</h2>

        <section>
          <h3 className="font-normal text-base mb-2">🧾 1. Overview</h3>
          <p className="text-sm">
            Greedy is a decentralized smart contract platform on Solana for time-based token
            distribution. Users participate by contributing SOL and selecting a claim time (“Greed
            Level”). Rewards are determined algorithmically. All interactions are permissionless and
            irreversible once signed on-chain.
          </p>
        </section>

        <section>
          <h3 className="font-normal text-base mb-2">✅ 2. Eligibility</h3>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>You must be at least 18 years old or the legal age in your jurisdiction.</li>
            <li>Use a non-custodial Solana wallet.</li>
            <li>
              Not be located in or a citizen of any jurisdiction where token sales are restricted.
            </li>
          </ul>
        </section>

        <section>
          <h3 className="font-normal text-base mb-2">🧠 3. User Responsibility</h3>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>You manage your wallet and private keys.</li>
            <li>Participation involves risk, including potential loss of SOL or tokens.</li>
            <li>Token amounts are determined on-chain and may vary from UI estimates.</li>
            <li>You are responsible for meeting legal and technical requirements.</li>
          </ul>
        </section>

        <section>
          <h3 className="font-normal text-base mb-2">🔒 4. Risk Disclaimer</h3>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Smart contracts may contain bugs or vulnerabilities.</li>
            <li>Token values may be volatile or speculative.</li>
            <li>Greedy does not offer financial advice or guarantee value/liquidity.</li>
            <li>You use the platform entirely at your own risk.</li>
          </ul>
        </section>

        <section>
          <h3 className="font-normal text-base mb-2">🎯 5. No Guarantees</h3>
          <p className="text-sm">
            Greedy provides no guarantees of success, results, or token value. If a sale fails to
            meet its target, refunds may be available per smart contract rules and may incur fees.
          </p>
        </section>

        <section>
          <h3 className="font-normal text-base mb-2">📬 6. Notifications</h3>
          <p className="text-sm">
            Optional Telegram or other notifications may be provided “as-is” without guarantee.
            You’re responsible for tracking your activity and claims on-chain.
          </p>
        </section>

        <section>
          <h3 className="font-normal text-base mb-2">🔄 7. Platform Changes</h3>
          <p className="text-sm">Greedy may evolve over time. Changes could include:</p>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>New distribution logic</li>
            <li>Support for more wallets/chains</li>
            <li>Governance changes</li>
          </ul>
          <p className="text-sm">No prior notice may be provided for these changes.</p>
        </section>

        <section>
          <h3 className="font-normal text-base mb-2">⚖️ 8. Legal & Compliance</h3>
          <p className="text-sm">
            Greedy is a non-custodial protocol on Solana. We do not offer financial services or KYC.
            You must comply with all laws and taxes in your jurisdiction.
          </p>
        </section>

        <section>
          <h3 className="font-normal text-base mb-2">📬 9. Contact</h3>
          <p className="text-sm">
            For technical issues or questions, reach us at:{' '}
            <a
              href="mailto:support@greedy.app"
              className="text-blue-400 underline hover:text-blue-300">
              support@greedy.app
            </a>
          </p>
        </section>

        <section>
          <h3 className="font-normal text-base mb-2">🛑 10. Final Acknowledgment</h3>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>You understand and accept the above risks.</li>
            <li>You acknowledge all on-chain actions are final.</li>
            <li>You use Greedy voluntarily at your own discretion.</li>
          </ul>
        </section>
      </div>
    </div>
  );
};

export default Terms;
