// components/ui/DateRangePicker.tsx
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon, XIcon, ArrowRightIcon } from "lucide-react";
import { format, isValid, subDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from "date-fns";
import { DateRange } from "react-day-picker";

interface DateRangePickerProps {
  dateRange: DateRange | undefined;
  onDateChange: (dateRange: DateRange | undefined) => void;
  className?: string;
  align?: "start" | "center" | "end";
  disabled?: boolean;
  showPresets?: boolean;
}

const presetButtonVariants = "w-full justify-start px-3 py-1.5 text-xs h-auto rounded-md";

export function DateRangePicker({
  dateRange,
  onDateChange,
  className,
  align = "start",
  disabled = false,
  showPresets: initialShowPresets = true, // Renamed to avoid conflict with internal state
}: DateRangePickerProps) {
  const [popoverOpen, setPopoverOpen] = React.useState(false);
  const [numberOfMonths, setNumberOfMonths] = React.useState(2);
  const [currentShowPresets, setCurrentShowPresets] = React.useState(initialShowPresets);

  React.useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 768; // Tailwind's 'md' breakpoint is 768px
      setNumberOfMonths(isMobile ? 1 : 2);
      if (initialShowPresets) { // Only hide presets if they were meant to be shown initially
        setCurrentShowPresets(!isMobile);
      }
    };

    handleResize(); // Set initial value
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [initialShowPresets]);


  const fromDate = dateRange?.from && isValid(dateRange.from) ? dateRange.from : undefined;
  const toDate = dateRange?.to && isValid(dateRange.to) ? dateRange.to : undefined;

  const handlePreset = (preset: 'today' | 'yesterday' | 'last7' | 'last30' | 'thisWeek' | 'lastWeek' | 'thisMonth' | 'lastMonth') => {
    const today = new Date();
    let from: Date | undefined;
    let to: Date | undefined = today;

    switch (preset) {
      case 'today':
        from = today;
        to = today;
        break;
      case 'yesterday':
        from = subDays(today, 1);
        to = subDays(today, 1);
        break;
      case 'last7':
        from = subDays(today, 6);
        to = today;
        break;
      case 'last30':
        from = subDays(today, 29);
        to = today;
        break;
      case 'thisWeek':
        from = startOfWeek(today, { weekStartsOn: 1 });
        to = endOfWeek(today, { weekStartsOn: 1 });
        break;
      case 'lastWeek':
        const lastWeekStart = startOfWeek(subDays(today, 7), { weekStartsOn: 1 });
        from = lastWeekStart;
        to = endOfWeek(lastWeekStart, { weekStartsOn: 1 });
        break;
      case 'thisMonth':
        from = startOfMonth(today);
        to = endOfMonth(today);
        break;
      case 'lastMonth':
        const firstDayLastMonth = startOfMonth(subDays(today, today.getDate()));
        from = firstDayLastMonth;
        to = endOfMonth(firstDayLastMonth);
        break;
    }
    onDateChange({ from, to });
    setPopoverOpen(false);
  };

  const clearDateRange = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    onDateChange(undefined);
  };

  const handleDateSelect = (selectedRange: DateRange | undefined) => {
    onDateChange(selectedRange);
  }

  const handlePopoverOpenChange = (open: boolean) => {
    setPopoverOpen(open);
  };

  return (
    <Popover open={popoverOpen} onOpenChange={handlePopoverOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full h-auto justify-start text-left font-normal group  data-[state=open]:ring-1 data-[state=open]:ring-primary",
            !fromDate && "text-muted-foreground",
            disabled && "cursor-not-allowed opacity-50",
            className
          )}
          disabled={disabled}
        >
          {/* Responsive layout for date display */}
          <div className="flex flex-col sm:flex-row items-center w-full">
            <div className="flex-1 px-3 py-2 text-center w-full sm:w-auto">
              <span className="block text-xs text-muted-foreground">Start Date</span>
              <span className={cn("font-medium", !fromDate && "text-muted-foreground")}>
                {fromDate ? format(fromDate, "LLL dd, y") : "Pick a date"}
              </span>
            </div>
            <ArrowRightIcon className="h-4 w-4 text-muted-foreground mx-0 sm:mx-2 my-1 sm:my-0 shrink-0 transform sm:transform-none rotate-90 sm:rotate-0" />
            <div className="flex-1 px-3 py-2 text-center w-full sm:w-auto">
              <span className="block text-xs text-muted-foreground">End Date</span>
              <span className={cn("font-medium", !toDate && "text-muted-foreground")}>
                {toDate ? format(toDate, "LLL dd, y") : "Pick a date"}
              </span>
            </div>
          </div>
           {fromDate && !disabled && (
             <XIcon
                className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-50 group-hover:opacity-100 transition-opacity"
                onClick={clearDateRange}
                aria-label="Clear date range"
            />
           )}
           {!fromDate && !disabled && (
            <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-50" />
           )}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-auto p-0 flex flex-col md:flex-row shadow-xl max-h-[90vh] overflow-y-auto"
        align={align}
      >
        {currentShowPresets && ( // Use internal state to control preset visibility
          <div className="flex flex-col space-y-1 p-3 border-b md:border-r md:border-b-0 bg-slate-50 md:w-[180px] shrink-0">
            <h4 className="text-xs font-semibold mb-1 text-slate-600 px-2">DATE PRESETS</h4>
            <Button variant="ghost" className={cn(presetButtonVariants, "hover:bg-slate-200 text-slate-700")} onClick={() => handlePreset('today')}>Today</Button>
            <Button variant="ghost" className={cn(presetButtonVariants, "hover:bg-slate-200 text-slate-700")} onClick={() => handlePreset('yesterday')}>Yesterday</Button>
            <Button variant="ghost" className={cn(presetButtonVariants, "hover:bg-slate-200 text-slate-700")} onClick={() => handlePreset('last7')}>Last 7 Days</Button>
            <Button variant="ghost" className={cn(presetButtonVariants, "hover:bg-slate-200 text-slate-700")} onClick={() => handlePreset('last30')}>Last 30 Days</Button>
            <Button variant="ghost" className={cn(presetButtonVariants, "hover:bg-slate-200 text-slate-700")} onClick={() => handlePreset('thisWeek')}>This Week</Button>
            <Button variant="ghost" className={cn(presetButtonVariants, "hover:bg-slate-200 text-slate-700")} onClick={() => handlePreset('lastWeek')}>Last Week</Button>
            <Button variant="ghost" className={cn(presetButtonVariants, "hover:bg-slate-200 text-slate-700")} onClick={() => handlePreset('thisMonth')}>This Month</Button>
            <Button variant="ghost" className={cn(presetButtonVariants, "hover:bg-slate-200 text-slate-700")} onClick={() => handlePreset('lastMonth')}>Last Month</Button>
             {fromDate && (
                <Button variant="ghost" className={cn(presetButtonVariants, "text-red-600 hover:bg-red-100 mt-2")} onClick={() => clearDateRange()}>Clear Selection</Button>
             )}
          </div>
        )}
        <div className="p-1">
            <Calendar
            initialFocus
            mode="range"
            defaultMonth={fromDate} 
            selected={dateRange}   
            onSelect={handleDateSelect} 
            numberOfMonths={numberOfMonths}
            disabled={disabled}
            className="[&_button[name='previous-month']]:bg-slate-100 [&_button[name='next-month']]:bg-slate-100"
            footer={
                <div className="p-3 border-t text-center text-sm text-muted-foreground">
                {fromDate && toDate ? (
                    `Selected: ${format(fromDate, "MMM d")} - ${format(toDate, "MMM d, yyyy")}`
                ) : fromDate ? (
                    `Selected start: ${format(fromDate, "MMM d, yyyy")}. Select end date.`
                ) : (
                    "Please pick a start date."
                )}
                </div>
            }
            />
        </div>
      </PopoverContent>
    </Popover>
  );
}
