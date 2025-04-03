// app/dashboard/analytics/call-history-table/page.tsx
"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CallHistoryTableComponent } from "@/components/AnalyticsDashboard/CallHistoryTableComponent";
import { CallHistoryFilters } from "@/components/AnalyticsDashboard/CallHistoryFilters";
import { CallHistoryTableFilters, FormattedCallTransactionDetails, FormattedCallDetailsResponse } from "@/types/callHistoryTable";
import { GetTotalCallsPageCountRequest } from "@/types/grpc";
import { useToast } from "@/hooks/use-toast";
import { useApi } from "@/hooks/useApi";
import { startOfDay, endOfDay } from "date-fns";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

const CallHistoryTable = () => {
  const { toast } = useToast();
  const api = useApi();
  
  const [loading, setLoading] = useState(false);
  const [callDetails, setCallDetails] = useState<FormattedCallTransactionDetails[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  const [filters, setFilters] = useState<CallHistoryTableFilters>({
    userId: 0,
    sortOrder: "desc",
    pageNumber: 1,
    pageSize: 10,
    callStatuses: ["call_created", "session_ended", "session_started", "call_missed", "call_rejected"],
    fromDate: startOfDay(new Date()),
    toDate: endOfDay(new Date()),
    isConsumer: false,
    isProvider: false,
  });

  const fetchTotalPages = async () => {
    try {
      const request: GetTotalCallsPageCountRequest = {
        callStatuses: filters.callStatuses,
        userId: filters.userId ? String(filters.userId) : "0",
        fromDate: {
          seconds: Math.floor(filters.fromDate.getTime() / 1000).toString(),
          nanos: 0
        },
        toDate: {
          seconds: Math.floor(filters.toDate.getTime() / 1000).toString(),
          nanos: 0
        },
        isConsumer: filters.isConsumer,
        isProvider: filters.isProvider,
        perPageEntries: filters.pageSize
      };
      
      const response = await api.fetch('/api/grpc/analytics/call-history-page-count', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      });

      const data = await response.json();

      console.log("Total Pages Response:", data);
      
      if (response.ok) {
        setTotalRecords(Number(data.totalCallCount));
        setTotalPages(Number(data.totalPageCount));
      } else {
        throw new Error(data.error?.details || data.message || "Failed to fetch call page count data");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to fetch total pages: ${(error as Error).message}`
      });
    }
  };

  const fetchCallDetails = async () => {
    setLoading(true);
    try {
      const requestData = {
        userId: filters.userId ? String(filters.userId) : "0",
        sortOrder: filters.sortOrder,
        pageNumber: filters.pageNumber,
        pageSize: filters.pageSize,
        callStatuses: filters.callStatuses,
        fromDate: {
          seconds: Math.floor(filters.fromDate.getTime() / 1000).toString(),
          nanos: 0
        },
        toDate: {
          seconds: Math.floor(filters.toDate.getTime() / 1000).toString(),
          nanos: 0
        },
        isConsumer: filters.isConsumer,
        isProvider: filters.isProvider
      };
      
      const response = await api.fetch('/api/grpc/analytics/call-history-table', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      });

      const data = await response.json() as FormattedCallDetailsResponse;
      

        setCallDetails(data.callDetails);
        setTotalRecords(Number(data.totalRecords));
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to fetch call details: ${(error as Error).message}`
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTotalPages();
  }, [
    filters.pageSize,
    filters.userId,
    filters.callStatuses,
    filters.fromDate,
    filters.toDate,
    filters.isConsumer,
    filters.isProvider
  ]);

  useEffect(() => {
    fetchCallDetails();
  }, [
    filters.pageNumber,
    filters.pageSize,
    filters.sortOrder
  ]);

  const handleFilterChange = (newFilters: Partial<CallHistoryTableFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters, pageNumber: 1 }));
  };

  const handleApplyFilters = () => {
    fetchCallDetails();
    fetchTotalPages();
  };

  const handleRefresh = () => {
    fetchCallDetails();
    fetchTotalPages();
  };

  return (
    <ProtectedRoute allowedRoutes={['/dashboard/analytics/call-history-table']}>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Call History</CardTitle>
          </CardHeader>
          <CardContent>
            <CallHistoryFilters 
              filters={filters} 
              onFilterChange={handleFilterChange}
              onApplyFilters={handleApplyFilters}
            />
            
            <div className="mt-6">
              <CallHistoryTableComponent 
                callDetails={callDetails}
                loading={loading}
                pageNumber={filters.pageNumber}
                pageSize={filters.pageSize}
                totalPages={totalPages}
                totalRecords={totalRecords}
                onPageChange={(page) => setFilters(prev => ({ ...prev, pageNumber: page }))}
                onPageSizeChange={(size) => setFilters(prev => ({ ...prev, pageSize: size, pageNumber: 1 }))}
                sortOrder={filters.sortOrder}
                onSortOrderChange={(order) => setFilters(prev => ({ ...prev, sortOrder: order }))}
                onRefresh={handleRefresh}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
};

export default CallHistoryTable;
