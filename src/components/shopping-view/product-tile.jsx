import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { brandOptionsMap, categoryOptionsMap } from "@/config";
import { Badge } from "../ui/badge";
import { Star } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";

function ShoppingProductTile({
  product,
  handleGetProductDetails,
  handleAddtoCart,
}) {

  return (


    <Card
      onClick={() => handleGetProductDetails(product._id)}
      className="group w-full max-w-[220px] h-[350px] mx-auto flex flex-col border border-gray-200 rounded-md overflow-hidden bg-white hover:shadow-md hover:-translate-y-0.5 transition"
    >
      {/* IMAGE */}
      <div className="relative flex justify-center items-center h-[180px] bg-gray-50">
        <img
          src={product?.image}
          alt={product?.title}
          className="max-h-full max-w-full object-contain"
        />
        {product?.totalStock === 0 ? (
          <Badge className="absolute top-2 left-2 text-[10px] px-1.5 py-0.5 bg-red-500">
            Out
          </Badge>
        ) : product?.totalStock < 10 ? (
          <Badge className="absolute top-2 left-2 text-[10px] px-1.5 py-0.5 bg-yellow-500">
            {`${product?.totalStock} left`}
          </Badge>
        ) : product?.salePrice > 0 ? (
          <Badge className="absolute top-2 left-2 text-[10px] px-1.5 py-0.5 bg-green-600">
            Sale
          </Badge>
        ) : null}
      </div>

      {/* CONTENT */}
      <div className=" flex flex-col p-2">
        <h2 className="text-sm font-medium line-clamp-2 min-h-[2.5rem] group-hover:text-blue-600 cursor-pointer">
          {product?.title}
        </h2>

        {/* Brand / Category */}
        <div className="flex justify-between text-[10px] text-gray-500 mt-1">
          <span>{categoryOptionsMap[product?.category]}</span>
          <span>{brandOptionsMap[product?.brand]}</span>
        </div>

        {/* Ratings (optional placeholder) */}


        {/* Price */}
        <div className="mt-2 flex items-center gap-2">
          {product?.salePrice > 0 && (
            <span className="text-xs text-gray-400 line-through">
              ${product?.price}
            </span>
          )}
          <span className="text-base font-bold text-gray-900">
            ${product?.salePrice > 0 ? product?.salePrice : product?.price}
          </span>
        </div>

        {/* Spacer pushes button down */}


      </div>

      {/* FOOTER */}
      <div className="px-2 pb-2 mt-0">
        {product?.totalStock === 0 ? (
          <Button className="w-full h-8 text-[12px] opacity-60 cursor-not-allowed">
            Out of Stock
          </Button>
        ) : (
          <Button
            onClick={(e) => {
              e.stopPropagation();
              handleAddtoCart(product?._id, product?.totalStock);
            }}
            className="w-full h-8 text-[12px]"
          >
            Add to Cart
          </Button>
        )}
      </div>
    </Card>
  );
}

export default ShoppingProductTile;
