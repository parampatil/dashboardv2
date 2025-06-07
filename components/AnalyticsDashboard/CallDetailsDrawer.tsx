// components/AnalyticsDashboard/CallDetailsDrawer.tsx
"use client";
import React from "react";
import { motion } from "framer-motion";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { formatTimestampToDate } from "@/lib/utils";
import { FormattedCallTransactionDetails } from "@/types/callHistoryTable";
import {
  Clock,
  User,
  MapPin,
  MessageSquare,
  DollarSign,
  Hash,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import CopyTooltip from "@/components/ui/CopyToolTip";

interface CallDetailsDrawerProps {
  isOpen: boolean;
  call: FormattedCallTransactionDetails | null;
  onClose: () => void;
}

const fadeInVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export const CallDetailsDrawer: React.FC<CallDetailsDrawerProps> = ({
  isOpen,
  call,
  onClose,
}) => {
  if (!call) return null;

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "session_started":
        return "bg-green-100 text-green-800 hover:bg-green-200";
      case "session_ended":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200";
      case "call_missed":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
      case "call_created":
        return "bg-purple-100 text-purple-800 hover:bg-purple-200";
      case "call_rejected":
        return "bg-red-100 text-red-800 hover:bg-red-200";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
  };

  return (
    <Drawer
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DrawerContent className="max-h-screen !select-text">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInVariants}
          transition={{ duration: 0.3 }}
        >
          <DrawerHeader className="border-b pb-4">
            <div className="flex justify-between items-center">
              <div>
                <DrawerTitle className="text-xl font-bold">
                  Call Details
                </DrawerTitle>
                <DrawerDescription className="flex items-center mt-1">
                  <Hash className="h-4 w-4 mr-1" />
                  <span className="mr-2">Call ID:</span>
                  <CopyTooltip
                    content={call.callId}
                    triggerContent={
                      <span className="bg-gray-100 px-2 py-1 rounded text-sm cursor-pointer">
                        {call.callId}
                      </span>
                    }
                  />
                </DrawerDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  className={`${getStatusBadgeClass(
                    call.callStatus
                  )} px-3 py-1`}
                >
                  {call.callStatus}
                </Badge>
                <DrawerClose asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label="Close"
                    onClick={onClose}
                  >
                    ✕
                  </Button>
                </DrawerClose>
              </div>
            </div>
          </DrawerHeader>

          <ScrollArea className="h-screen">
            <Tabs defaultValue="basic" className="w-full px-4 py-2">
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="participants">Participants</TabsTrigger>
                <TabsTrigger value="timestamps">Timestamps</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <motion.div
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  transition={{ staggerChildren: 0.1 }}
                >
                  <InfoCard
                    icon={<Clock className="h-5 w-5 text-blue-500" />}
                    title="Duration"
                    value={call.callDuration}
                  />
                  <InfoCard
                    icon={<DollarSign className="h-5 w-5 text-green-500" />}
                    title="Charge"
                    value={"$" + call.charge}
                  />
                  <InfoCard
                    icon={<MessageSquare className="h-5 w-5 text-purple-500" />}
                    title="Context"
                    value={call.context || "No context provided"}
                  />
                  <InfoCard
                    icon={<MapPin className="h-5 w-5 text-red-500" />}
                    title="Location"
                    value={call.location || "No location data"}
                  />
                </motion.div>
                <motion.div className="mt-4" variants={fadeInVariants}>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">
                    Session ID
                  </h3>
                  <CopyTooltip
                    content={call.sessionId}
                    triggerContent={
                      <span className="bg-gray-100 px-2 py-1 rounded text-sm cursor-pointer">
                        {call.sessionId}
                      </span>
                    }
                  />
                </motion.div>
              </TabsContent>

              <TabsContent value="participants" className="space-y-4">
                <ParticipantCard
                  title="Consumer"
                  name={call.consumerName || "Unknown User"}
                  id={call.consumerId}
                  joinTime={formatTimestampToDate(call.consumerJoinTimestamp)}
                  leaveTime={formatTimestampToDate(call.consumerLeaveTimestamp)}
                />
                <ParticipantCard
                  title="Provider"
                  name={call.providerName || "Unknown User"}
                  id={call.providerId}
                  joinTime={formatTimestampToDate(call.providerJoinTimestamp)}
                  leaveTime={formatTimestampToDate(call.providerLeaveTimestamp)}
                />
              </TabsContent>

              <TabsContent value="timestamps" className="space-y-4">
                <motion.div
                  className="bg-gray-50 rounded-lg p-4"
                  variants={fadeInVariants}
                >
                  <h3 className="font-medium mb-3">Call Timeline</h3>
                  <TimelineItem
                    label="Created"
                    time={formatTimestampToDate(call.createdAt)}
                  />
                  <TimelineItem
                    label="Session Started"
                    time={formatTimestampToDate(call.sessionStartTimestamp)}
                  />
                  <TimelineItem
                    label="Consumer Joined"
                    time={formatTimestampToDate(call.consumerJoinTimestamp)}
                  />
                  <TimelineItem
                    label="Provider Joined"
                    time={formatTimestampToDate(call.providerJoinTimestamp)}
                  />
                  <TimelineItem
                    label="Provider Left"
                    time={formatTimestampToDate(call.providerLeaveTimestamp)}
                  />
                  <TimelineItem
                    label="Consumer Left"
                    time={formatTimestampToDate(call.consumerLeaveTimestamp)}
                  />
                  <TimelineItem
                    label="Session Ended"
                    time={formatTimestampToDate(call.sessionEndTimestamp)}
                  />
                  <TimelineItem
                    label="Last Updated"
                    time={formatTimestampToDate(call.callUpdatedTimestamp)}
                    isLast
                  />
                </motion.div>
              </TabsContent>
            </Tabs>
          </ScrollArea>

          <DrawerFooter className="border-t pt-4">
            <DrawerClose asChild>
              <Button variant="outline">Close</Button>
            </DrawerClose>
          </DrawerFooter>
        </motion.div>
      </DrawerContent>
    </Drawer>
  );
};

const InfoCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  value: string;
}> = ({ icon, title, value }) => (
  <motion.div className="bg-gray-50 rounded-lg p-4" variants={fadeInVariants}>
    <div className="flex items-center mb-2">
      {icon}
      <h3 className="text-sm font-medium text-gray-500 ml-2">{title}</h3>
    </div>
    <p className="text-gray-900">{value}</p>
  </motion.div>
);

const ParticipantCard: React.FC<{
  title: string;
  name: string;
  id: string;
  joinTime: string;
  leaveTime: string;
}> = ({ title, name, id, joinTime, leaveTime }) => (
  <motion.div className="bg-gray-50 rounded-lg p-4" variants={fadeInVariants}>
    <div className="flex items-center mb-3">
      <User className="h-5 w-5 text-gray-500" />
      <h3 className="font-medium ml-2">{title}</h3>
    </div>
    <div className="space-y-2">
      <div>
        <p className="text-sm text-gray-500">Name</p>
        <p className="font-medium">{name}</p>
      </div>
      <div>
        <p className="text-sm text-gray-500">ID</p>
        <CopyTooltip
          content={id}
          triggerContent={
            <span className="bg-gray-100 px-2 py-1 rounded text-sm cursor-pointer">
              {id}
            </span>
          }
        />
      </div>
      <div className="grid grid-cols-2 gap-2 mt-2">
        <div>
          <p className="text-sm text-gray-500">Joined</p>
          <p className="text-sm">{joinTime}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Left</p>
          <p className="text-sm">{leaveTime}</p>
        </div>
      </div>
    </div>
  </motion.div>
);

const TimelineItem: React.FC<{
  label: string;
  time: string;
  isLast?: boolean;
}> = ({ label, time, isLast = false }) => (
  <motion.div className="flex mb-2" variants={fadeInVariants}>
    <div className="mr-3 relative">
      <div className="w-3 h-3 bg-blue-500 rounded-full mt-1"></div>
      {!isLast && (
        <div className="h-full w-0.5 bg-gray-200 absolute top-4 left-1.5"></div>
      )}
    </div>
    <div className="flex-1 pb-2">
      <p className="text-sm font-medium">{label}</p>
      <p className="text-xs text-gray-500">{time}</p>
    </div>
  </motion.div>
);
