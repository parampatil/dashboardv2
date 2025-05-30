// components/UsersDashboard/TransactionHistorySection.tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatProtoTimestamp } from "@/lib/utils";
import { ConsumerPurchaseTransaction, ProviderEarningTransaction, TransactionStatus, RefundStatus, ProviderEarningPayoutStatus } from "@/types/grpc";

interface TransactionHistorySectionProps {
  purchaseHistory: ConsumerPurchaseTransaction[] | null;
  earningTransactions: ProviderEarningTransaction[] | null;
  loadingHistory: boolean;
  loadingTransactions: boolean;
}

export function TransactionHistorySection({
  purchaseHistory,
  earningTransactions,
  loadingHistory,
  loadingTransactions,
}: TransactionHistorySectionProps) {
  return (
    <div className="mt-6">
      <Tabs defaultValue="purchases" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="purchases">Purchase History</TabsTrigger>
          <TabsTrigger value="earnings">Earning Transactions</TabsTrigger>
        </TabsList>
        <TabsContent value="purchases">
          <PurchaseHistoryTable purchases={purchaseHistory} loadingHistory={loadingHistory} />
        </TabsContent>
        <TabsContent value="earnings">
          <EarningTransactionsTable transactions={earningTransactions} loadingTransactions={loadingTransactions} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function PurchaseHistoryTable({ purchases, loadingHistory }: { purchases: ConsumerPurchaseTransaction[] | null, loadingHistory: boolean }) {
  return (
    <div className="rounded-md border">
      <ScrollArea className="h-[400px]">
        <table className="w-full">
          <thead className="sticky top-0 bg-gray-50">
            <tr className="border-b">
              <th className="p-3 text-left text-sm font-medium text-gray-500">
                Transaction ID
              </th>
              <th className="p-3 text-left text-sm font-medium text-gray-500">
                Offer Name
              </th>
              <th className="p-3 text-left text-sm font-medium text-gray-500">
                Total Minutes
              </th>
              <th className="p-3 text-left text-sm font-medium text-gray-500">
                Unused Minutes
              </th>
              <th className="p-3 text-left text-sm font-medium text-gray-500">
                Refund Amount
              </th>
              <th className="p-3 text-left text-sm font-medium text-gray-500">
                Purchase Amount
              </th>
              <th className="p-3 text-left text-sm font-medium text-gray-500">
                Purchase Date
              </th>
              <th className="p-3 text-left text-sm font-medium text-gray-500">
                Transaction Status
              </th>
              <th className="p-3 text-left text-sm font-medium text-gray-500">
                Refund Status
              </th>
            </tr>
          </thead>
          <tbody>
            {!loadingHistory ? (purchases ? (
              purchases.length > 0 ? (
                purchases.map((item) => (
                  <tr
                    key={item.transactionId}
                    className="border-b hover:bg-gray-50"
                  >
                    <td className="p-3 text-sm">{item.transactionId}</td>
                    <td className="p-3 text-sm">{item.offerName}</td>
                    <td className="p-3 text-sm">{item.totalMinutes} min</td>
                    <td className="p-3 text-sm">{item.totalUnusedMinutes} min</td>
                    <td className="p-3 text-sm">
                      {item.totalRefundAmount} {item.purchaseCurrency}
                    </td>
                    <td className="p-3 text-sm">
                      {item.purchaseAmount} {item.purchaseCurrency}
                    </td>
                    <td className="p-3 text-sm">
                      {formatProtoTimestamp(item.purchaseTimestamp)}
                    </td>
                    <td className="p-3 text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          item.transactionStatus === TransactionStatus.SUCCESS
                            ? "bg-green-100 text-green-800"
                            : item.transactionStatus === TransactionStatus.FAILED
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {item.transactionStatus}
                      </span>
                    </td>
                    <td className="p-3 text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          item.refundStatus === RefundStatus.SUCCESS
                            ? "bg-green-100 text-green-800"
                            : item.refundStatus === RefundStatus.UNAVAILABLE
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {item.refundStatus}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="p-3 text-sm text-center">
                    No purchase history found
                  </td>
                </tr>
              )
            ) : (
              <tr>
                <td colSpan={9} className="p-3 text-sm text-center">
                  Click the fetch button
                </td>
              </tr>
            )) : (
                <tr>
                    <td colSpan={9} className="p-3 text-sm text-center">
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </ScrollArea>
    </div>
  );
}

function EarningTransactionsTable({
  transactions,
  loadingTransactions,
}: {
  transactions: ProviderEarningTransaction[] | null;
  loadingTransactions: boolean;
}) {
  return (
    <div className="rounded-md border">
      <ScrollArea className="h-[400px]">
        <table className="w-full">
          <thead className="sticky top-0 bg-gray-50">
            <tr className="border-b">
              <th className="p-3 text-left text-sm font-medium text-gray-500">
                Transaction ID
              </th>
              <th className="p-3 text-left text-sm font-medium text-gray-500">
                Timestamp
              </th>
              <th className="p-3 text-left text-sm font-medium text-gray-500">
                Call Duration (sec)
              </th>
              <th className="p-3 text-left text-sm font-medium text-gray-500">
                Rate (per sec)
              </th>
              <th className="p-3 text-left text-sm font-medium text-gray-500">
                Amount
              </th>
              <th className="p-3 text-left text-sm font-medium text-gray-500">
                Transaction Type
              </th>
              <th className="p-3 text-left text-sm font-medium text-gray-500">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {!loadingTransactions ? (
              transactions ? (
                transactions.length > 0 ? (
                  transactions.map((item) => (
                    <tr
                      key={item.transactionId}
                      className="border-b hover:bg-gray-50"
                    >
                      <td className="p-3 text-sm">{item.transactionId}</td>
                      <td className="p-3 text-sm">
                        {formatProtoTimestamp(item.transactionTimestamp)}
                      </td>
                      <td className="p-3 text-sm">{item.callDuration}</td>
                      <td className="p-3 text-sm">
                        {item.rate} {item.currency}
                      </td>
                      <td className="p-3 text-sm">
                        {item.amount} {item.currency}
                      </td>
                      <td className="p-3 text-sm">{item.transactionType}</td>
                      <td className="p-3 text-sm">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            item.status === ProviderEarningPayoutStatus.PAID
                              ? "bg-green-100 text-green-800"
                              : item.status === ProviderEarningPayoutStatus.FAILED
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="p-3 text-sm text-center">
                      No earning transactions found
                    </td>
                  </tr>
                )
              ) : (
                <tr>
                  <td colSpan={7} className="p-3 text-sm text-center">
                    Click the fetch button
                  </td>
                </tr>
              )
            ) : (
              <tr>
                <td colSpan={7} className="p-3 text-sm text-center">
                  <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </ScrollArea>
    </div>
  );
}
