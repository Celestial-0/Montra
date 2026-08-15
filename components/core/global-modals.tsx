import React from 'react';
import { AccountModal } from './accounts/account-modal';
import { TransferModal } from './accounts/transfer-modal';
import { BudgetModal } from './budgets/budget-modal';
import { CategoryModal } from './categories/category-modal';
import { TransactionFilterSheet } from './transactions/transaction-filter-sheet';
import { TransactionModal } from './transactions/transaction-modal';

export function GlobalModals() {
  return (
    <>
      <TransactionModal />
      <TransferModal />
      <AccountModal />
      <BudgetModal />
      <CategoryModal />
      <TransactionFilterSheet />
    </>
  );
}
