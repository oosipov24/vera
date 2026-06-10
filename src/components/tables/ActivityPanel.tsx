import { useState } from 'react';
import { ExecutionsTable } from './ExecutionsTable';
import { TransactionsTable } from './TransactionsTable';

type Tab = 'executions' | 'transactions';

/** Center activity area: tabbed Executions / Deposits-Withdrawals tables. */
export function ActivityPanel() {
  const [tab, setTab] = useState<Tab>('executions');

  return (
    <div className="activity-panel">
      <div className="o-tabs">
        <button className={`o-tab ${tab === 'executions' ? 'on' : ''}`} onClick={() => setTab('executions')}>
          Executions
        </button>
        <button className={`o-tab ${tab === 'transactions' ? 'on' : ''}`} onClick={() => setTab('transactions')}>
          Deposits/Withdrawals
        </button>
      </div>

      {tab === 'executions' ? <ExecutionsTable /> : <TransactionsTable />}
    </div>
  );
}
