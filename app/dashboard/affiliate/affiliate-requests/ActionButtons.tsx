// app/dashboard/affiliate/affiliate-requests/ActionButtons.tsx
'use client';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
import { AffiliateRequest, AffiliateRequestStatus,  } from '@/types/grpc';

interface ActionButtonsProps {
  request: AffiliateRequest;
  adminUserId?: string;
  onUpdate: (requestId: number, newStatus: AffiliateRequestStatus, approverUserId?: string) => void;
}

export default function ActionButtons({ request, adminUserId, onUpdate }: ActionButtonsProps) {
  if (request.status !== 'REQUESTED') {
    return <span className="text-gray-500">Completed</span>;
  }

  return (
    <div className="flex space-x-2">
      <Button
        size="sm"
        onClick={() => onUpdate(request.request_id, 'APPROVED', adminUserId)}
        className="flex items-center bg-green-400"
      >
        <Check className="mr-1" size={16} />
        Approve
      </Button>
      <Button
        size="sm"
        variant="destructive"
        onClick={() => onUpdate(request.request_id, 'REJECTED', adminUserId)}
        className="flex items-center"
      >
        <X className="mr-1" size={16} />
        Reject
      </Button>
    </div>
  );
}
