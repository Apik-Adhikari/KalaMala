import { Search } from "lucide-react"; 

export default function SearchBar() {
  return (
    <div className="">
        
        <input
          type="text"
          placeholder="Search products..."
          className=""
        />

        <button
          type="submit"
          className=""
        >
          <Search className="" />
        </button>

      
    </div>
  );
}