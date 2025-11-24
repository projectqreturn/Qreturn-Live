import React from "react";
import { Check } from "lucide-react";
import { cn } from "../../app/lib/utils.js";

const PostCard = ({
  postId,
  imageUrl,
  title,
  category,
  isVerified = false,
  hasReward = false,
  rewardAmount,
  location,
  date = "Today",
  className,
}) => {
  return (
    <div
      className={cn(
        "group relative overflow-hidden flex items-start gap-3 p-3 rounded-xl animate-fade-in cursor-pointer bg-[rgba(224,224,224,0.8)] backdrop-blur-[20px] transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(0,0,0,0.05)] after:content-[''] after:absolute after:top-0 after:left-0 after:w-[200%] after:h-full after:bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent)] after:-translate-x-full after:pointer-events-none after:transition-transform after:duration-[1500ms] after:ease-out hover:after:translate-x-full text-gray-950",
        className
      )}
      data-post-id={postId}
    >
      <div className="relative h-24 w-24 flex-shrink-0 rounded-lg overflow-hidden">
        <img
          src={imageUrl}
          alt={title}
          className={cn(
            "h-full w-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-[1.03]"
          )}
          loading="lazy"
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex flex-col">
          <h3 className="text-base font-semibold truncate tracking-tight leading-none mb-1 text-gray-950">
            {title}
          </h3>

          <p className="text-sm text-gray-950 mb-1">{category}</p>

          <div className="flex items-center gap-2 mb-2">
            {isVerified && (
              <div
                className={cn(
                  "text-white text-xs px-1.5 py-0.5 rounded-full flex items-center relative overflow-hidden bg-gradient-to-br from-[#3498db] to-[#2980b9]"
                )}
              >
                <Check className="h-3 w-3 mr-0.5" />
                <span className="text-[10px]">Verified User</span>
              </div>
            )}

            {hasReward && rewardAmount && (
              <div
                className={cn(
                  "text-white text-xs px-1.5 py-0.5 rounded-full flex items-center relative overflow-hidden bg-gradient-to-br from-[#9b59b6] to-[#8e44ad]"
                )}
              >
                <svg
                  className="h-3 w-3 mr-0.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 15C15.866 15 19 11.866 19 8C19 4.13401 15.866 1 12 1C8.13401 1 5 4.13401 5 8C5 11.866 8.13401 15 12 15Z"
                    stroke="white"
                    strokeWidth="2"
                  />
                  <path
                    d="M8.21 13.89L7 23L12 20L17 23L15.79 13.88"
                    stroke="white"
                    strokeWidth="2"
                  />
                </svg>
                <span className="text-[10px]">Reward</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-between items-end">
          <div>
            {hasReward && rewardAmount ? (
              <p className="font-bold text-gray-950">{rewardAmount}</p>
            ) : (
              <p className="font-medium text-gray-950">{rewardAmount}</p>
            )}
            <p className="text-xs text-gray-950">{location}</p>
          </div>

          <div className="text-xs text-gray-950">{date}</div>
        </div>
      </div>
    </div>
  );
};

export default PostCard;
