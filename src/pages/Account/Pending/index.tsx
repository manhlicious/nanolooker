import * as React from "react";
import { useTranslation } from "react-i18next";
import { Tooltip, Typography } from "antd";
import { ExclamationCircleTwoTone } from "@ant-design/icons";
import BigNumber from "bignumber.js";
import usePending, { PendingBlock } from "api/hooks/use-pending";
import useBlocksInfo from "api/hooks/use-blocks-info";
import { AccountInfoContext } from "api/contexts/AccountInfo";
import TransactionsTable from "pages/Account/Transactions";
import { raiToRaw, rawToRai, toBoolean } from "components/utils";

import type { Subtype } from "types/transaction";

const MAX_PENDING_TRANSACTIONS = 50;
const TRANSACTIONS_PER_PAGE = 5;
const { Title } = Typography;

interface PendingHistoryBlock extends PendingBlock {
  hash: string;
  account: string;
  subtype: Subtype;
  confirmed: boolean;
  local_timestamp: String;
}

const PENDING_MIN_THRESHOLD = 0.0001;

const AccountPendingHistory: React.FC = () => {
  const { t } = useTranslation();
  const { account, accountInfo } = React.useContext(AccountInfoContext);
  const {
    pending: { blocks = {} } = {},
    isLoading: isAccountHistoryLoading,
  } = usePending(account, {
    count: String(MAX_PENDING_TRANSACTIONS),
    sorting: true,
    source: true,
    threshold: new BigNumber(raiToRaw(PENDING_MIN_THRESHOLD)).toFixed(),
    include_only_confirmed: false,
  });
  const [hashes, setHashes] = React.useState<string[]>([]);
  const { blocks: blocksInfo } = useBlocksInfo(hashes);
  const totalPending = Object.keys(blocks).length;
  const isPaginated = true;
  const showPaginate = totalPending > TRANSACTIONS_PER_PAGE;
  const [currentPage, setCurrentPage] = React.useState<number>(1);

  let pendingHistory: PendingHistoryBlock[] | undefined = undefined;

  if (totalPending) {
    pendingHistory = Object.entries(blocks).map(
      // @ts-ignore
      ([block, { amount, source }]): PendingHistoryBlock => ({
        hash: block,
        amount,
        local_timestamp: blocksInfo.blocks?.[block]?.local_timestamp,
        confirmed: toBoolean(blocksInfo.blocks?.[block]?.confirmed),
        account: source,
        subtype: "pending",
      }),
    );
  }

  const start = 0 + (currentPage - 1) * TRANSACTIONS_PER_PAGE;
  const data = pendingHistory?.slice(start, start + TRANSACTIONS_PER_PAGE);

  React.useEffect(() => {
    const hashes = Object.keys(blocks);
    if (!hashes.length) return;
    setHashes(hashes?.slice(start, start + TRANSACTIONS_PER_PAGE));
  }, [blocks, start]);

  const accountPending = accountInfo?.pending
    ? new BigNumber(rawToRai(accountInfo?.pending)).toNumber()
    : 0;

  return accountPending > PENDING_MIN_THRESHOLD ? (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
        }}
      >
        <Title level={3}>
          {isAccountHistoryLoading ? "" : pendingHistory?.length}{" "}
          {t("pages.account.pendingTransactions")}
        </Title>

        {pendingHistory?.length === MAX_PENDING_TRANSACTIONS ? (
          <Tooltip
            placement="right"
            title={t("tooltips.pendingTransactionCount", {
              count: MAX_PENDING_TRANSACTIONS,
            })}
          >
            <ExclamationCircleTwoTone twoToneColor={"orange"} />
          </Tooltip>
        ) : null}
      </div>

      <TransactionsTable
        data={data}
        isLoading={isAccountHistoryLoading}
        isPaginated={isPaginated}
        showPaginate={showPaginate}
        pageSize={TRANSACTIONS_PER_PAGE}
        currentPage={currentPage}
        totalPages={pendingHistory?.length}
        setCurrentPage={setCurrentPage}
      />
    </>
  ) : null;
};

export default AccountPendingHistory;
