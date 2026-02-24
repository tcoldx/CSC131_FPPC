
'use client';
import React, {useState} from 'react';
export default function Home() {
  const [searchItem, setSearchitem] = useState('');
  const [searchResult, setSearchResult] = useState('');

  const dummyData = [
    { id: 1, name: 'Jeff Dawson', email: 'jeff.dawson@example.com' },
    { id: 2, name: 'lee erickson', email: 'jeff.dawson@example.com' },
    { id: 3, name: 'Lawrence Hayes', email: 'jeff.dawson@example.com' },
  ];

  const handleChange = (e: any) => {
    const searchTerm = e.target.value.toLowerCase();
    const filteredData = dummyData.find((item) => item.name.toLowerCase() === searchTerm);
    setSearchitem(filteredData ? filteredData.name : '');
  }
  const handleSubmit = (e: any) => {
    e.preventDefault();
    const filteredDummyData = dummyData.find((item) => item.name.toLowerCase() === searchItem.toLowerCase());
    setSearchResult(filteredDummyData ? filteredDummyData.name : 'No results found');
    // test 123 adding update for fetch. (if you see this your amazing!!);
    // second test just adding a branch (like i said. you are amazing if you see this!!);
  }
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <div className="flex flex-col items-center gap-4 gap-8">
        {/* content container for dashboard and input */}
        <div className="flex flex-row items-center gap-4">
          <div className="flex items-center justify-center w-64 h-65 border border-gray-300">
            <h1 className="text-gray-500">{searchResult || "no name found!"}</h1>
          </div>
          <div className="flex items-center justify-center w-64 h-65 border border-gray-300"></div>
        </div>
        {/* search input */}
        <div className="flex flex-row justify-center items-center gap-4">
      <input onChange={(e) => handleChange(e)} type="text" placeholder="Search" className="rounded-md border-2 border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:bg-gray-800 dark:border-gray-600 dark:focus:border-blue-400" />
      <button className="bg-green-300 border border-gray-300 px-4 py-2 rounded-md" onClick={(e) => handleSubmit(e)}>Submit</button>
      </div>
      </div>
    </div>
  );
}
