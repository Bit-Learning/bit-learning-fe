import { AppleIcon, BriefcaseBusinessIcon, FacebookIcon, MailIcon, SlackIcon } from "lucide-react";
import Button from "./buttonv2";
import { Icons } from "./icons";

const SocialButton = () => {
    return (
        <div className="flex w-full flex-col items-center justify-center gap-8">
            <div className="flex flex-col gap-4">
                <div className="flex flex-wrap items-center justify-center gap-4">
                    <Button variant="outline" iconLeft={<MailIcon />}>
                        Login with Email
                    </Button>
                    <Button variant="outline" iconLeft={<Icons.google />}>
                        Continue with Google
                    </Button>
                    <Button variant="outline" iconLeft={<Icons.gitHub />}>
                        Continue with GitHub
                    </Button>
                    <Button variant="outline" iconLeft={<FacebookIcon />}>
                        Login with Facebook
                    </Button>
                    <Button variant="outline" iconLeft={<Icons.twitter />}>
                        Login with X
                    </Button>
                    <Button variant="outline" iconLeft={<AppleIcon />}>
                        Login with Apple
                    </Button>
                    <Button variant="outline" iconLeft={<Icons.logo />}>
                        Login with Microsoft
                    </Button>
                    <Button variant="outline" iconLeft={<SlackIcon />}>
                        Login with Slack
                    </Button>
                    <Button variant="outline" iconLeft={<BriefcaseBusinessIcon />}>
                        Login with LinkedIn
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default SocialButton;
