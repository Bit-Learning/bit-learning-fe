import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import type { RootState } from "@/shared/redux/store";

export type TCartState = {
  itemCount: number;
};

const cartInitialState: TCartState = {
  itemCount: 0,
};

const setCartItemCount = (state: TCartState, action: PayloadAction<number>) => {
  state.itemCount = action.payload;
};

const incrementCartItemCount = (state: TCartState) => {
  state.itemCount += 1;
};

const decrementCartItemCount = (state: TCartState) => {
  if (state.itemCount > 0) {
    state.itemCount -= 1;
  }
};

const resetCartItemCount = () => {
  return cartInitialState;
};

export const cart = createSlice({
  name: "cart",
  initialState: cartInitialState,
  reducers: {
    setCartItemCountAction: setCartItemCount,
    incrementCartItemCountAction: incrementCartItemCount,
    decrementCartItemCountAction: decrementCartItemCount,
    resetCartItemCountAction: resetCartItemCount,
  },
});

export const {
  setCartItemCountAction,
  incrementCartItemCountAction,
  decrementCartItemCountAction,
  resetCartItemCountAction,
} = cart.actions;

export const selectCartState = (state: RootState) => state.cart;
export const selectCartItemCount = (state: RootState) => state.cart.itemCount;

export default cart.reducer;
