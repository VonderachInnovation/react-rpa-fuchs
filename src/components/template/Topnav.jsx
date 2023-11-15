import React from 'react'

function Topnav() {
  return (
    <nav className="fixed w-full border-gray-200 px-2 sm:px-2 py-2.5 bg-gray-600 z-40">
    <div className="container flex flex-wrap items-center mx-auto md:pl-64 pr-4">
        <div className="flex w-full justify-between">
            <button type="button" className="md:invisible text-gray-400 hover:bg-gray-700 focus:outline-none focus:ring-4 focus:ring-gray-700 rounded-lg text-sm p-2.5 mr-1">
                <svg className="w-7 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                 
                </svg>
            </button>
            <div className="relative">
                <div className="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    </svg>
                </div>
                <button id="dropdownDefault" data-dropdown-toggle="dropdown" className="block md:hidden text-white bg-gray-700 hover:bg-gray-500 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-4 py-2.5 text-center inline-flex items-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800" type="button">
                    <span className="text-gray-700 hover:text-gray-500">XX</span>
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        
                    </svg>
                </button>
                <div id="dropdown" className="z-10 hidden bg-white divide-y divide-gray-100 rounded shadow w-44 dark:bg-gray-700">
                    <ul className="py-1 text-sm text-gray-700 dark:text-gray-200" aria-labelledby="dropdownDefault">
                        <li>
                            <a href="#" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Fuchs Sachverstaendige GmbH</a>
                        </li>
                        <li>
                            <a href="#" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">BW Schweier & Partner</a>
                        </li>
                        <li>
                            <a href="#" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">ValueRise Consulting GmbH</a>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
    </nav>
  )
}

export default Topnav