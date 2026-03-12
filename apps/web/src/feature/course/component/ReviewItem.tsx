import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/Avatar";
import { Badge } from "@workspace/ui/components/Badge";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { Clock, Star } from "lucide-react";
import type React from "react";
import type { ReviewResponse } from "../types/interaction.type";

interface ReviewItemProps {
  review: ReviewResponse;
}

const ReviewItem: React.FC<ReviewItemProps> = ({ review }) => {
  const fullName = `${review.user.firstName} ${review.user.lastName}`.trim();

  const timeAgo = formatDistanceToNow(new Date(review.createdAt), {
    addSuffix: true,
    locale: vi,
  });

  return (
    <div className="flex gap-3 border-b border-gray-100 pb-6 last:border-b-0">
      <Avatar className="h-12 w-12 shrink-0">
        <AvatarImage src={review.user.avatar} alt={fullName} />
        <AvatarFallback className="bg-blue-100 text-blue-700">
          {review.user.firstName.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1">
        <div className="mb-2 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900">{fullName}</span>
            </div>
            <div className="mt-1 flex items-center gap-2">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={index}
                    className={`h-4 w-4 ${index < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-500">•</span>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Clock className="h-3 w-3" />
                <span>{timeAgo}</span>
              </div>
            </div>
          </div>
        </div>

        {review.comment && <p className="whitespace-pre-wrap text-gray-700">{review.comment}</p>}
      </div>
    </div>
  );
};

export default ReviewItem;
