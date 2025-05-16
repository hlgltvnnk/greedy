import { providers } from 'near-api-js';
import { showToast } from './toast';
import { env } from '../config/env';
import { EModals } from '../interfaces/modals';

const explorerUrl = `https://${env.NETWORK === 'testnet' ? 'testnet.' : ''}nearblocks.io`;

const PROPERTY_NAME = 'FunctionCall';
const PROPERTY_NAME_2 = 'Delegate';

export enum ETransactionAction {
  Participate = 'Participate',
  Claim = 'Claim',
  CreateAsset = 'CreateAsset',
}

export enum ETransactionStatus {
  Success = 'Success',
  Failed = 'Failed',
  TimeoutExpired = 'TimeoutExpired',
  InsufficientFunds = 'InsufficientFunds',
}

const METHODS = {
  claim: 'claim',
  ft_transfer_call: 'ft_transfer_call',
};

class TransactionParseService {
  public parseNearTransactions = (
    txs: providers.FinalExecutionOutcome[],
    {
      nearAction,
      airdropId,
    }: { nearAction?: ETransactionAction | null; airdropId?: string | null },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    showModal?: (modal: EModals, params?: any) => void,
  ) => {
    const result: {
      status: ETransactionStatus;
      hash: string;
    } = this.analyzeTransactions(txs);
    const href = `${explorerUrl}/txns/${result.hash}`;

    const data = {
      [ETransactionAction.Claim]: {
        success: 'Claim success',
        failed: 'Claim failed',
        showModal: () => showModal?.(EModals.CLAIM_SUCCESS, { airdropId }),
      },
      [ETransactionAction.Participate]: {
        success: 'Participate success',
        failed: 'Participate failed',
        showModal: () => showModal?.(EModals.PARTICIPATE_SUCCESS, { airdropId }),
      },
      [ETransactionAction.CreateAsset]: {
        success: 'Create asset success',
        failed: 'Create asset failed',
        showModal: () => {},
      },
    };

    if (!nearAction) {
      if (result.status === ETransactionStatus.Success) {
        return showToast('success', 'Transaction success', {
          link: { href, text: 'Open transaction', target: '_blank' },
        });
      } else if (result.status === ETransactionStatus.Failed) {
        return showToast('error', 'Transaction failed', {
          link: { href, text: 'Open transaction', target: '_blank' },
        });
      }
      return;
    }

    if (result.status === ETransactionStatus.Success) {
      showToast('success', data[nearAction].success, {
        link: { href, text: 'Open transaction', target: '_blank' },
      });
      data[nearAction].showModal();
      return;
    } else if (result.status === ETransactionStatus.Failed) {
      return showToast('error', data[nearAction].failed, {
        link: { href, text: 'Open transaction', target: '_blank' },
      });
    }
  };

  private analyzeTransactions = (
    transactions: providers.FinalExecutionOutcome[],
  ): {
    status: ETransactionStatus;
    hash: string;
  } => {
    const { transaction } = this.getTransaction(transactions);
    if (!transaction) {
      return { status: ETransactionStatus.Failed, hash: '' };
    }
    const { hash, status } = this.detailsTransaction(transaction);
    return { status, hash };
  };

  private detailsTransaction = (transaction: providers.FinalExecutionOutcome) => {
    const { hash } = transaction.transaction;
    let successStatus = Object.prototype.hasOwnProperty.call(transaction.status, 'SuccessValue');

    if (
      transaction.receipts_outcome.some((receipt) =>
        Object.prototype.hasOwnProperty.call(receipt.outcome.status, 'Failure'),
      )
    ) {
      successStatus = false;
    }

    const containsErrorLog = transaction.receipts_outcome.some((receipt) =>
      receipt.outcome.logs.some((log) => log.toLowerCase().includes('error')),
    );
    if (containsErrorLog) {
      console.warn(`🚨 Transaction ${hash} has 'ERROR' log — marking as Failed`);
      successStatus = false;
    }

    return {
      hash,
      status: successStatus ? ETransactionStatus.Success : ETransactionStatus.Failed,
    };
  };

  private getTransaction = (transactions: providers.FinalExecutionOutcome[]) => {
    const [transaction] = transactions.filter(
      (tx: providers.FinalExecutionOutcome) =>
        Object.values(METHODS).indexOf(tx.transaction.actions[0][PROPERTY_NAME]?.method_name) !==
          -1 ||
        Object.values(METHODS).indexOf(
          tx.transaction.actions[0][PROPERTY_NAME_2]?.delegate_action?.actions?.[0]?.[PROPERTY_NAME]
            ?.method_name,
        ) !== -1,
    );

    return { transaction };
  };
}

export const transactionParser = new TransactionParseService();
