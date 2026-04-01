import Button from "./buttonv2"
import {
  ShoppingCartIcon,
  HeartIcon,
  StarIcon,
  ShareIcon,
} from "lucide-react"

const CommerceButton = () => {
    return (
      <div className="flex w-full flex-col items-center justify-center gap-8">
          {/* E-commerce Buttons */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-center gap-4">
                <Button variant="default" iconLeft={<ShoppingCartIcon />}>
                    Buy Now
                </Button>
                <Button variant="outline" iconLeft={<HeartIcon />}>
                    Save for Later
                </Button>
                <Button variant="secondary" iconLeft={<StarIcon />}>
                    Write Review
                </Button>
                <Button variant="ghost" iconLeft={<ShareIcon />}>
                    Share Product
                </Button>
            </div>
          </div>
      </div>
    );
  }

  export default CommerceButton;
