import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  isLoading: false,
  productList: [],
  productDetails: null,
};

export const fetchAllFilteredProducts = createAsyncThunk(
  "/products/fetchAllProducts",
  async ({ filterParams, sortParams }) => {
    

    const query = new URLSearchParams({
      ...filterParams,
      sortBy: sortParams,
    });
     
    const result = await axios.get(
      `https://completebackend-6.onrender.com/api/v1/products/getProducts?${query}`
    );

    

    return result?.data;
  }
);

export const fetchProductDetails = createAsyncThunk(
  "/products/fetchProductDetails",
  async (id) => {
  
    const result = await axios.get(
      `https://completebackend-6.onrender.com/api/v1/products/get/${id}`
    );

    return result?.data;
  }
);
export const allProducts = createAsyncThunk("/products/getAllProducts",async()=> {
  const result = await axios.get("https://completebackend-6.onrender.com/api/v1/products/get-products");
  return result.data;
})
const shoppingProductSlice = createSlice({
  name: "shoppingProducts",
  initialState,
  reducers: {
    setProductDetails: (state) => {
      state.productDetails = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllFilteredProducts.pending, (state, action) => {
        state.isLoading = true;
      })
      .addCase(fetchAllFilteredProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.productList = action.payload.data;
      })
      .addCase(fetchAllFilteredProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.productList = [];
      })
      .addCase(fetchProductDetails.pending, (state, action) => {
        state.isLoading = true;
      })
      .addCase(fetchProductDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        
        state.productDetails = action.payload.data;
      })
      .addCase(fetchProductDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.productDetails = null;
      }).addCase(allProducts.pending,(state)=> {
        state.isLoading= true;
      }).addCase(allProducts.fulfilled,(state,action)=> {
        state.isLoading=false,
        
        state.productList= action.payload
      });
  },
});

export const { setProductDetails } = shoppingProductSlice.actions;

export default shoppingProductSlice.reducer;
