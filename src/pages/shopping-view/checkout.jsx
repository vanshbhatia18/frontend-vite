import Address from "@/components/shopping-view/address";

import { useDispatch, useSelector } from "react-redux";
import UserCartItemsContent from "@/components/shopping-view/cart-items-content";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { createNewOrder, capturePayment } from "@/store/shop/order-slice";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { removeCart } from "@/store/shop/cart-slice";

function ShoppingCheckout() {
  const { cartItems } = useSelector((state) => state.shopCart);
  const { user } = useSelector((state) => state.auth);
  const { toast } = useToast();
  const dispatch = useDispatch();
  const navigate = useNavigate()
  const [currentSelectedAddress, setCurrentSelectedAddress] = useState(null);
  const [isPaymentStart, setIsPaymentStart] = useState(false);

  const totalCartAmount =
    cartItems && cartItems.items && cartItems.items.length > 0
      ? cartItems.items.reduce(
        (sum, currentItem) =>
          sum +
          (currentItem?.salePrice > 0
            ? currentItem?.salePrice
            : currentItem?.price) *
          currentItem?.quantity,
        0
      )
      : 0;

  async function handleInitiateRazorpayPayment() {
    if (!cartItems || cartItems.items.length === 0) {
      toast({
        title: "Your cart is empty. Please add items to proceed",
        variant: "destructive",
      });
      return;
    }
    if (!currentSelectedAddress) {
      toast({
        title: "Please select one address to proceed.",
        variant: "destructive",
      });
      return;
    }

    const orderData = {
      userId: user?._id,
      cartId: cartItems?._id,
      cartItems: cartItems.items.map((singleCartItem) => ({
        productId: singleCartItem?.productId,
        title: singleCartItem?.title,
        image: singleCartItem?.image,
        price:
          singleCartItem?.salePrice > 0
            ? singleCartItem?.salePrice
            : singleCartItem?.price,
        quantity: singleCartItem?.quantity,
      })),
      addressInfo: {
        addressId: currentSelectedAddress?._id,
        address: currentSelectedAddress?.address,
        city: currentSelectedAddress?.city,
        pincode: currentSelectedAddress?.pincode,
        phone: currentSelectedAddress?.phone,
        notes: currentSelectedAddress?.notes,
      },
      orderStatus: "pending",
      paymentMethod: "razorpay",
      paymentStatus: "pending",
      totalAmount: totalCartAmount,
      orderDate: new Date(),
      orderUpdateDate: new Date(),
    };

    setIsPaymentStart(true);


    dispatch(createNewOrder(orderData)).then((response) => {
      if (response?.payload?.success) {
        const { razorpayOrderId, amount, currency, orderId } = response.payload;

        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID, // from .env
          amount: amount,
          currency: currency,
          name: "My Shop",
          description: "Order Payment",
          order_id: razorpayOrderId,
          handler: async function (paymentResult) {
            // Step 3: Call backend to verify and capture payment

            dispatch(
              capturePayment({
                razorpay_order_id: paymentResult.razorpay_order_id,
                razorpay_payment_id: paymentResult.razorpay_payment_id,
                razorpay_signature: paymentResult.razorpay_signature,
                orderId,
              })
            ).then((verifyRes) => {

              if (verifyRes?.payload?.success) {
                toast({
                  title: "Payment successful! Your order is confirmed.",
                });
                dispatch(removeCart(cartItems))
                navigate("/shop/home")
              } else {
                toast({
                  title: "Payment failed. Please try again.",
                  variant: "destructive",
                });
              }
            })

          },
          prefill: {
            name: user?.name,
            email: user?.email,
            contact: currentSelectedAddress?.phone,
          },
          theme: {
            color: "#3399cc",
          },
        };

        const razorpayInstance = new window.Razorpay(options);
        razorpayInstance.open();
      } else {
        setIsPaymentStart(false);
        toast({
          title: "Failed to create Razorpay order. Try again later.",
          variant: "destructive",
        });
      }
    })

  }

  return (
    <div className="flex flex-col">
      <div className="relative h-[300px] w-full overflow-hidden">

      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-5 p-5">
        <Address
          selectedId={currentSelectedAddress}
          setCurrentSelectedAddress={setCurrentSelectedAddress}
        />
        <div className="flex flex-col gap-4">
          {cartItems && cartItems.items && cartItems.items.length > 0
            ? cartItems.items.map((item) => (
              <UserCartItemsContent key={item.productId} cartItem={item} />
            ))
            : null}
          <div className="mt-8 space-y-4">
            <div className="flex justify-between">
              <span className="font-bold">Total</span>
              <span className="font-bold">₹{totalCartAmount}</span>
            </div>
          </div>
          <div className="mt-4 w-full">
            <Button
              onClick={handleInitiateRazorpayPayment}
              className="w-full"
              disabled={isPaymentStart}
            >
              {isPaymentStart
                ? "Processing Razorpay Payment..."
                : "Checkout with Razorpay"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShoppingCheckout;
