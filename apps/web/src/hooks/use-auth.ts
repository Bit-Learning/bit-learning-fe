// import React from "react";
// import { useDispatch } from "react-redux";
// import { getAccessToken } from "@/lib/cookies";
// import { setUserInfoAction, setIsAuthenticatedAction } from "@/features/auth";
// import { GetMyWallets } from "@/services/wallets";
// import { setCurrentWalletAction } from "@/features/wallets";
// import { GetAccountProfile } from "@/services/account";

// const useAuth = () => {
//   const dispatch = useDispatch();
//   const [loading, setLoading] = React.useState<boolean>(true);

//   React.useEffect(() => {
//     const fetchUser = async () => {
//       const accessToken = getAccessToken();
//       if (!accessToken) {
//         setLoading(false);
//         return;
//       }
//       try {
//         const response = await GetAccountProfile();
//         if (response.data.data) {
//           dispatch(setIsAuthenticatedAction(true));
//           dispatch(setUserInfoAction(response.data.data));
//         }
//       } catch (error) {
//         console.error("Error fetching profile:", error);
//       } finally {
//         setLoading(false);
//       }
//       try {
//         if (accessToken) {
//           const walletResponse = await GetMyWallets();
//           if (walletResponse.data.success) {
//             const filteredContent = walletResponse.data.data?.filter(
//               (wallet: any) => wallet.currency === "USD"
//             );
//             dispatch(setCurrentWalletAction(filteredContent?.[0] || null));
//           }
//         }
//       } catch (error) {
//         console.error("Error fetching user profile:", error);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchUser();
//   }, [dispatch]);
//   return { loading };
// };

// export default useAuth;
