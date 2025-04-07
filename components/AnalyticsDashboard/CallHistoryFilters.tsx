// components/AnalyticsDashboard/CallHistoryFilters.tsx
"use client";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CallHistoryTableFilters } from "@/types/callHistoryTable";
import { format, startOfDay, endOfDay } from "date-fns";
import { motion } from "framer-motion";
import { 
  Calendar as CalendarIcon, 
  RotateCcw, 
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  Card,
  CardContent
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import debounce from "lodash/debounce";


interface CallHistoryFiltersProps {
  filters: CallHistoryTableFilters;
  onFilterChange: (filters: Partial<CallHistoryTableFilters>) => void;
  onApplyFilters: () => void;
  onReset?: () => void;
}

export function CallHistoryFilters({ filters, onFilterChange, onApplyFilters, onReset }: CallHistoryFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localUserId, setLocalUserId] = useState<string>(filters.userId === 0 ? "" : filters.userId.toString());
  
  const callStatusOptions = [
    { value: "session_started", label: "Session Started" },
    { value: "session_ended", label: "Session Ended" },
    { value: "call_missed", label: "Call Missed" },
    { value: "call_created", label: "Call Created" },
    { value: "call_rejected", label: "Call Rejected" }
  ];

  const handleCallStatusChange = (status: string, checked: boolean) => {
    const updatedStatuses = checked
      ? [...filters.callStatuses, status]
      : filters.callStatuses.filter(s => s !== status);
    
    onFilterChange({ callStatuses: updatedStatuses });
  };

  const handleReset = () => {
    if (onReset) {
      onReset();
    } else {
      onFilterChange({
        userId: 0,
        sortOrder: "desc",
        pageNumber: 1,
        pageSize: 10,
        callStatuses: ["call_created", "session_ended", "session_started", "call_missed", "call_rejected"],
        fromDate: startOfDay(new Date()),
        toDate: endOfDay(new Date()),
        isConsumer: true,
        isProvider: true
      });
      onApplyFilters();
    }
  };

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handleToggleConsumer = () => {
    onFilterChange({ isConsumer: !filters.isConsumer });
  };

  const handleToggleProvider = () => {
    onFilterChange({ isProvider: !filters.isProvider });
  };

  const handleUserIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setLocalUserId(inputValue); // Update local state immediately for responsive UI
    const value = inputValue === "" ? 0 : parseInt(inputValue);
    debouncedUserIdChange(value); // Debounce the actual filter change
  };

  const debouncedUserIdChange = useMemo(
    () => debounce((value: number) => {
      onFilterChange({ userId: value });
    }, 500),
    [onFilterChange]
  );

  useEffect(() => {
    return () => {
      debouncedUserIdChange.cancel();
    };
  }, [debouncedUserIdChange]);


  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Filters</h3>
            <div className="flex gap-2">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleToggleExpand}
                >
                  {isExpanded ? <ChevronUp className="h-4 w-4 mr-1" /> : <ChevronDown className="h-4 w-4 mr-1" />}
                  {isExpanded ? "Collapse" : "Expand"}
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleReset}
                >
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Reset
                </Button>
              </motion.div>
            </div>
          </div>
          
            <motion.div 
            className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-hidden`}
            animate={{ height: isExpanded ? "auto" : "4rem",
            opacity: isExpanded ? 1 : 0.5
             }}
            initial={{ height: 0 }}
            transition={{ duration: 0.3 }}
            >
            <div>
              <Label htmlFor="userId">User ID</Label>
              <Input
              id="userId"
              type="number"
              value={localUserId}
              onChange={handleUserIdChange}
              placeholder="Enter user ID"
              className="mt-1"
              />
            </div>
            
              <>
              <div>
                <Label>From Date</Label>
                <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left mt-1">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(filters.fromDate, "PPP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                  mode="single"
                  selected={filters.fromDate}
                  onSelect={(date) => date && onFilterChange({ fromDate: startOfDay(date) })}
                  initialFocus
                  />
                </PopoverContent>
                </Popover>
              </div>
              
              <div>
                <Label>To Date</Label>
                <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left mt-1">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(filters.toDate, "PPP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                  mode="single"
                  selected={filters.toDate}
                  onSelect={(date) => date && onFilterChange({ toDate: endOfDay(date) })}
                  initialFocus
                  />
                </PopoverContent>
                </Popover>
              </div>
              
              <div className="flex flex-col gap-2">
                <Label>User Type</Label>
                <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center space-x-2 bg-gray-50 p-2 rounded-md flex-1">
                  <Switch
                  id="consumer-switch"
                  checked={filters.isConsumer}
                  onCheckedChange={handleToggleConsumer}
                  />
                  <Label htmlFor="consumer-switch" className="cursor-pointer">Consumer</Label>
                </div>
                <div className="flex items-center space-x-2 bg-gray-50 p-2 rounded-md flex-1">
                  <Switch
                  id="provider-switch"
                  checked={filters.isProvider}
                  onCheckedChange={handleToggleProvider}
                  />
                  <Label htmlFor="provider-switch" className="cursor-pointer">Provider</Label>
                </div>
                </div>
              </div>
              
              <div className="md:col-span-2 lg:col-span-3">
                <Label>Call Status</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 mt-1">
                {callStatusOptions.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2 bg-gray-50 p-2 rounded-md">
                  <Checkbox
                    id={`status-${option.value}`}
                    checked={filters.callStatuses.includes(option.value)}
                    onCheckedChange={(checked) => 
                    handleCallStatusChange(option.value, checked as boolean)
                    }
                  />
                  <Label htmlFor={`status-${option.value}`} className="cursor-pointer">{option.label}</Label>
                  </div>
                ))}
                </div>
              </div>
              </>
            </motion.div>
          
          <motion.div 
            className="mt-4 flex justify-end"
          >
            <Button onClick={onApplyFilters} className="hover:scale-105 transition-transform duration-200">
              Apply Filters
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
