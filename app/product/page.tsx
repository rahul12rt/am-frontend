"use client";
import WatchForm from "@/components/watches/WatchForm";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { MdKeyboardArrowRight } from "react-icons/md";

const Collection = () => {
  const searchParams = useSearchParams();
  const watchId = searchParams.get("id");
  return (
    <section className="pt-[90px] pb-[70px] bg-black-1 text-white-1">
      <div className="container">
        <p className="flex items-center text-[14px] pb-[40px] gap-2">
          <Link href="/" className="opacity-60 hover:opacity-100">
            Home
          </Link>
          <MdKeyboardArrowRight />

          {watchId ? (
            <>
              {" "}
              <Link href="/product" className="opacity-60 hover:opacity-100">
                Edit Product
              </Link>
              <MdKeyboardArrowRight />
              <span>{watchId}</span>{" "}
            </>
          ) : (
            <span>Add Product</span>
          )}
        </p>

        <WatchForm />
      </div>
    </section>
  );
};

export default Collection;
