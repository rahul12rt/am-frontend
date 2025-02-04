import NewCollectionWatch from "@/components/molecules/newCollectionWatch/NewCollectionWatch";
import { collectionItems } from "@/data/watches";

const NewCollection = () => {
  return (
    <section className="pb-[25px]">
      <div
        className="h-[670px] bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url("/images/newCollection.png")' }}
      >
        <div className="container translate-y-[-50%]">
          <div className="flex justify-end items-center">
            <div className="overflow-hidden w-[66px] whitespace-nowrap flex items-center leading-[12px] marquee bg-white-1 text-black-1 text-[1rem] font-bold rounded-[4px] py-[6px]">
              <span>NEW - NEW-</span>
              <span aria-hidden="true">NEW - NEW-</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-[80px] max-[768px]:pb-[0px]">
        <div className="flex justify-between items-center text-center gap-[30px] max-[768px]:flex-wrap max-[768px]:justify-center max-[768px]:gap-[50px]">
          {collectionItems.map((item, index) => (
            <NewCollectionWatch key={index} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewCollection;
