import { Fragment, useEffect, useRef, useState } from 'react'
import { ToastContainer, toast } from 'react-toastify';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid'
import {
  FaceFrownIcon,
  FaceSmileIcon,
  FireIcon,
  HandThumbUpIcon,
  HeartIcon,
  PaperClipIcon,
  CheckIcon,
  ChevronUpDownIcon 
} from '@heroicons/react/20/solid'
import { Dialog, Transition, Listbox } from '@headlessui/react'
import moment from 'moment';
import {
  ChartBarSquareIcon,
  Cog6ToothIcon,
  FolderIcon,
  GlobeAltIcon,
  ServerIcon,
  SignalIcon,
  XMarkIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline'
import { Bars3Icon, MagnifyingGlassIcon } from '@heroicons/react/20/solid'
import { supabase } from '../../supabaseClient'

const selectFlow = [
  { id: 1, name: 'RPA-Hagelakte (mit OCR)' },
  { id: 2, name: 'RPA-Hagelakte (ohne OCR)' },
]

const selectOption = [
  { id: 1, name: 'ohne Hagelscanner' },
  { id: 2, name: 'mit Hagelscanner' },
]

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: GlobeAltIcon, current: true },
  { name: 'Aktivität', href: '/activity', icon: SignalIcon, current: false },
  { name: 'Einstellungen', href: '/settings', icon: Cog6ToothIcon, current: false },
]
const teams = [
  { id: 1, name: 'RPA-Hagelakte (mit OCR)', href: '#', initial: 'r', current: false },
  { id: 2, name: 'RPA-Hagelakte (ohne OCR)', href: '#', initial: 'r', current: false },
  { id: 3, name: 'RPA-Hagelakte (Beta)', href: '#', initial: 'T', current: false },
]

const stats = [
  { name: 'Aufträge', value: '405' },
  { name: 'Durchschnittliche Bearbeitungszeit', value: '3.65', unit: 'mins' },
  { name: 'Angemeldete Agents', value: '3' },
  { name: 'Erfolgsrate', value: '98.5%' },
]
const statuses = { OPEN: 'text-gray-400 bg-gray-400/10', QUEUED: 'text-orange-400 bg-orange-400/10', WIP: 'text-blue-500 bg-blue-500/10', ERROR: 'text-rose-400 bg-rose-400/10', SUCCESS: 'text-green-400 bg-green-400/10' }


function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [openDetail, setOpenDetail] = useState(false);

  var [secondaryNavigation, setsecondaryNavigation] = useState([
    { name: 'Übersicht', href: 'ALL', current: true },
    { name: 'Offen', href: 'OPEN', current: false },
    { name: 'In Bearbeitung', href: 'WIP', current: false },
    { name: 'Abgeschlossen', href: 'SUCCESS', current: false },
    { name: 'Fehler', href: 'ERROR', current: false },
  ]);

  const [openModal, setOpenModal] = useState(false);
  const cancelButtonRef = useRef(null)

  // supabase stuff
  const [error, setError] = useState(null);
  const [process, setProcess] = useState([]);
  const [user, setUser] = useState([])
  const [id, setId] = useState(null);
  const [currentProcess, setCurrentProcess] = useState({"id": 0,"created_at": "","reference_fuchs": "","reference_insurance": "","license_plate": "","order_date": "","closing_date": "","insurance": "","prolicyholder": "","deleted": false,"execution_status": ""});
  const [currentExecutions, setCurrentExecutions] = useState([]);

  const referencefuchsRef = useRef();
  const referenceinsuranceRef = useRef();
  const licenseplateRef = useRef();
  const insuranceRef = useRef();

  const [selectedFlow, setSelectedFlow] = useState(selectFlow[0])
  const [selectedOption, setSelectedOption] = useState(selectOption[0])

  const [activity, setActivity] = useState([]);

  const startFlow = async () => {

    var ocr_option = true;
    var hailscan_option = false
    
    if (selectFlow.id === 2) {
      ocr = false;
    }

    if (selectedOption.id === 2) {
      hailscan_option = true;
    }

    const rs_create_process = await supabase
    .from("execution")
    .insert({ocr: ocr_option, hailscan: hailscan_option, flow_name: 'RPA-Hagelakte', fkey_process: currentProcess.id})
    .select("*")
    .single()
    
    console.log(rs_create_process);

  }

  const showDetail = async (id) => {

    setOpenDetail(true);
    setId(id);

    const rs_process = await supabase.from("process").select("*").eq("id", id).single();
    const rs_execution = await supabase.from("execution").select("*").eq("fkey_process", id);

    if (rs_process.data) {
      setCurrentProcess(rs_process.data);
    }

    if (rs_execution.data) {
      setCurrentExecutions(rs_execution.data);
    }

    var activityBuild = [];

    activityBuild.push({ id: 1, type: 'INFO', message: "Der Auftrag wurde erfolgreich angelegt.", date: moment(rs_process.data.created_at).format('DD.MM.YYYY'), dateTime: rs_process.data.created_at });

    rs_execution.data.forEach(item => {
      console.log("Test" + item.execution_status);
      let index = activityBuild.length;

      activityBuild.push({ id: index+1, type: 'INFO', message: "Der Auftrag wurde zur Bearbeitung markiert.", date: moment(item.created_at).format('DD.MM.YYYY'), dateTime: item.created_at },);

      if (item.execution_status === "SUCCESS") {
        activityBuild.push({ id: index+2, type: 'SUCCESS', message: "Der Auftrag wurde erfolgreich bearbeitet.", date: moment(item.updated_at).format('DD.MM.YYYY'), dateTime: item.updated_at });
      } else if (item.execution_status === "ERROR") {
        activityBuild.push({
          id: index+2,
          type: 'ERROR',
          message: item.error_text,
          date: moment(item.updated_at).format('DD.MM.YYYY'),
          dateTime: item.updated_at,
        });
      }

    });

    setActivity(activityBuild)

    console.log(activity);
    console.log(rs_process);

  }

  const handleCreateProcess = async () => {

    const referenceFuchs = referencefuchsRef.current.value;
    const referenceinsurance = referenceinsuranceRef.current.value;
    const licenseplate = licenseplateRef.current.value;
    const insurance = insuranceRef.current.value;

    const rs = await supabase
        .from("process")
        .insert({reference_fuchs: referenceFuchs, reference_insurance: referenceinsurance, license_plate: licenseplate, insurance: insurance})
        .select("*")
        .single();

    setError(rs.error);

    if (rs.data) {
      setProcess( (currentProcess) => [...currentProcess, rs.data ] );
      notify;
    }

    referencefuchsRef.current.value = "";
    referenceinsuranceRef.current.value = "";
    licenseplateRef.current.value = "";
    insuranceRef.current.value = "";

    console.log(rs);
    

  }

  const getProcess = async (tab) => {
    if (tab === "ALL") {
      const rs = await supabase
      .from("process")
      .select("id, reference_fuchs, reference_insurance, license_plate, insurance, order_date, execution_status");
      console.log(rs);
      setProcess(rs.data);
    } else if (tab === "OPEN") {
      const rs = await supabase
      .from("process")
      .select("id, reference_fuchs, reference_insurance, license_plate, insurance, order_date, execution_status")
      .eq("execution_status", "OPEN");
      console.log(rs);
      setProcess(rs.data);
    } else if (tab === "WIP") {
      const rs = await supabase
      .from("process")
      .select("id, reference_fuchs, reference_insurance, license_plate, insurance, order_date, execution_status")
      .eq("execution_status", "WIP");
      console.log(rs);
      setProcess(rs.data);
    } else if (tab === "SUCCESS") {
      const rs = await supabase
      .from("process")
      .select("id, reference_fuchs, reference_insurance, license_plate, insurance, order_date, execution_status")
      .eq("execution_status", "SUCCESS");
      console.log(rs);
      setProcess(rs.data);
    } else if (tab === "ERROR") {
      const rs = await supabase
      .from("process")
      .select("id, reference_fuchs, reference_insurance, license_plate, insurance, order_date, execution_status")
      .eq("execution_status", "ERROR");
      console.log(rs);
      setProcess(rs.data);
    }
  }

  const getUser = async () => {
    const rs = await supabase.auth.getUser();
    console.log(rs);
    setUser(rs.data);
    setError(rs.error);
  }


  useEffect(() => {
    getProcess("ALL");
    getUser();
  },[]);

  return (
    <>
      {/*
        This Dashboard requires updating your template:

        ```
        <html class="h-full bg-gray-900">
        <body class="h-full">
        ```
      */}
      <div>
        <Transition.Root show={sidebarOpen} as={Fragment}>
          <Dialog as="div" className="relative z-50 xl:hidden" onClose={setSidebarOpen}>
            <Transition.Child
              as={Fragment}
              enter="transition-opacity ease-linear duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity ease-linear duration-300"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-gray-900/80" />
            </Transition.Child>

            <div className="fixed inset-0 flex">
              <Transition.Child
                as={Fragment}
                enter="transition ease-in-out duration-300 transform"
                enterFrom="-translate-x-full"
                enterTo="translate-x-0"
                leave="transition ease-in-out duration-300 transform"
                leaveFrom="translate-x-0"
                leaveTo="-translate-x-full"
              >
                <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                  <Transition.Child
                    as={Fragment}
                    enter="ease-in-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in-out duration-300"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                      <button type="button" className="-m-2.5 p-2.5" onClick={() => setSidebarOpen(false)}>
                        <span className="sr-only">Close sidebar</span>
                        <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                      </button>
                    </div>
                  </Transition.Child>
                  {/* Sidebar component, swap this element with another sidebar if you like */}
                  <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-gray-900 px-6 ring-1 ring-white/10">
                    <div className="flex h-16 shrink-0 items-center">
                      <img
                        className="h-8 w-auto"
                        src="/assets/fuchs-logo.svg"
                        alt="Fuchs Logo"
                      />
                    </div>
                    <nav className="flex flex-1 flex-col">
                      <ul role="list" className="flex flex-1 flex-col gap-y-7">
                        <li>
                          <ul role="list" className="-mx-2 space-y-1">
                            {navigation.map((item) => (
                              <li key={item.name}>
                                <a
                                  href={item.href}
                                  className={classNames(
                                    item.current
                                      ? 'bg-gray-800 text-white'
                                      : 'text-gray-400 hover:text-white hover:bg-gray-800',
                                    'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
                                  )}
                                >
                                  <item.icon className="h-6 w-6 shrink-0" aria-hidden="true" />
                                  {item.name}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </li>
                        <li>
                          <div className="text-xs font-semibold leading-6 text-gray-400">Deine RPAs</div>
                          <ul role="list" className="-mx-2 mt-2 space-y-1">
                            {teams.map((team) => (
                              <li key={team.name}>
                                <a
                                  href={team.href}
                                  className={classNames(
                                    team.current
                                      ? 'bg-gray-800 text-white'
                                      : 'text-gray-400 hover:text-white hover:bg-gray-800',
                                    'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
                                  )}
                                >
                                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-gray-700 bg-gray-800 text-[0.625rem] font-medium text-gray-400 group-hover:text-white">
                                    {team.initial}
                                  </span>
                                  <span className="truncate">{team.name}</span>
                                </a>
                              </li>
                            ))}
                          </ul>
                        </li>
                        <li className="-mx-6 mt-auto">
                          <a
                            href="#"
                            className="flex items-center gap-x-4 px-6 py-3 text-sm font-semibold leading-6 text-white hover:bg-gray-800"
                          >
                            <img
                              className="h-8 w-8 rounded-full bg-gray-800"
                              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                              alt=""
                            />
                            <span className="sr-only">Your profile</span>
                            <span aria-hidden="true">Tom Cook</span>
                          </a>
                        </li>
                      </ul>
                    </nav>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition.Root>

        {/* Static sidebar for desktop */}
        <div className="hidden xl:fixed xl:inset-y-0 xl:z-50 xl:flex xl:w-72 xl:flex-col">
          {/* Sidebar component, swap this element with another sidebar if you like */}
          <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-black/10 px-6 ring-1 ring-white/5">
            <div className="flex h-16 shrink-0 items-center">
              <img
                className="h-8 w-20"
                src="assets/fuchs-logo.svg"
                alt="FUCHS"
              />
            </div>
            <nav className="flex flex-1 flex-col">
              <ul role="list" className="flex flex-1 flex-col gap-y-7">
                <li>
                  <ul role="list" className="-mx-2 space-y-1">
                    {navigation.map((item) => (
                      <li key={item.name}>
                        <a
                          href={item.href}
                          className={classNames(
                            item.current
                              ? 'bg-gray-800 text-white'
                              : 'text-gray-400 hover:text-white hover:bg-gray-800',
                            'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
                          )}
                        >
                          <item.icon className="h-6 w-6 shrink-0" aria-hidden="true" />
                          {item.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </li>
                <li>
                  <div className="text-xs font-semibold leading-6 text-gray-400">Deine RPAs</div>
                  <ul role="list" className="-mx-2 mt-2 space-y-1">
                    {teams.map((team) => (
                      <li key={team.name}>
                        <a
                          href={team.href}
                          className={classNames(
                            team.current
                              ? 'bg-gray-800 text-white'
                              : 'text-gray-400 hover:text-white hover:bg-gray-800',
                            'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
                          )}
                        >
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-gray-700 bg-gray-800 text-[0.625rem] font-medium text-gray-400 group-hover:text-white">
                            {team.initial}
                          </span>
                          <span className="truncate">{team.name}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </li>
                <li className="-mx-6 mt-auto">
                  <a
                    href="#"
                    className="flex items-center gap-x-4 px-6 py-3 text-sm font-semibold leading-6 text-white hover:bg-gray-800"
                  >
                    <img
                      className="h-8 w-8 rounded-full bg-gray-800"
                      src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                      alt=""
                    />
                    <span className="sr-only">Dein Profil</span>
                    <span aria-hidden="true">Niklas Vonderach</span>
                  </a>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        <div className="xl:pl-72">
          {/* Sticky search header */}
          <div className="sticky top-0 z-9 flex h-16 shrink-0 items-center gap-x-6 border-b border-white/5 bg-gray-900 px-4 shadow-sm sm:px-6 lg:px-8">
            <button type="button" className="-m-2.5 p-2.5 text-white xl:hidden" onClick={() => setSidebarOpen(true)}>
              <span className="sr-only">Open sidebar</span>
              <Bars3Icon className="h-5 w-5" aria-hidden="true" />
            </button>

            <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
              <form className="flex flex-1" action="#" method="GET">
                <label htmlFor="search-field" className="sr-only">
                  Suche
                </label>
                <div className="relative w-full">
                  <MagnifyingGlassIcon
                    className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-gray-500"
                    aria-hidden="true"
                  />
                  <input
                    id="search-field"
                    className="block h-full w-full border-0 bg-transparent py-0 pl-8 pr-0 text-white focus:ring-0 sm:text-sm"
                    placeholder="Suche..."
                    type="search"
                    name="search"
                  />
                </div>
              </form>
            </div>
          </div>

          <main>
            <header>
              {/* Secondary navigation */}
              <nav className="flex overflow-x-auto border-b border-white/10 py-4">
                <ul
                  role="list"
                  className="flex min-w-full flex-none gap-x-6 px-4 text-sm font-semibold leading-6 text-gray-400 sm:px-6 lg:px-8"
                >
                  {secondaryNavigation.map((item) => (
                    <li key={item.name}>
                      <a onClick={() => {
                          getProcess(item.href);
                          let newNav = [];
                          
                          secondaryNavigation.forEach(i => {
                            
                            if (i.name === item.name) {
                              newNav.push({ name: i.name, href: i.href, current: true });
                            } else {
                              newNav.push({ name: i.name, href: i.href, current: false });
                            }
                          });

                          setsecondaryNavigation(newNav);
                          console.log(item);
                        }} href='#' className={item.current ? 'text-indigo-400' : ''}>
                        {item.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>

              {/* Heading */}
              <div className="flex flex-col items-start justify-between gap-x-8 gap-y-4 bg-gray-700/10 px-4 py-4 sm:flex-row sm:items-center sm:px-6 lg:px-8">
                <div>
                  <div className="flex items-center gap-x-3">
                    <div className="flex-none rounded-full bg-green-400/10 p-1 text-green-400">
                      <div className="h-2 w-2 rounded-full bg-current" />
                    </div>
                    <h1 className="flex gap-x-3 text-base leading-7">
                      <span className="font-semibold text-white">Fuchs-SP.de</span>
                      <span className="text-gray-600">/</span>
                      <span className="font-semibold text-white">rpa-tool</span>
                    </h1>
                  </div>
                  <p className="mt-2 text-xs leading-6 text-gray-400">Zeigt alle aktuell angelegte Vorgänge an</p>
                </div>
                <button
                        type="button"
                        onClick={() => setOpen(true)}
                        className="rounded-md bg-white/10 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-white/20"
                      >Manuell anlegen</button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 bg-gray-700/10 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, statIdx) => (
                  <div
                    key={stat.name}
                    className={classNames(
                      statIdx % 2 === 1 ? 'sm:border-l' : statIdx === 2 ? 'lg:border-l' : '',
                      'border-t border-white/5 py-6 px-4 sm:px-6 lg:px-8'
                    )}
                  >
                    <p className="text-sm font-medium leading-6 text-gray-400">{stat.name}</p>
                    <p className="mt-2 flex items-baseline gap-x-2">
                      <span className="text-4xl font-semibold tracking-tight text-white">{stat.value}</span>
                      {stat.unit ? <span className="text-sm text-gray-400">{stat.unit}</span> : null}
                    </p>
                  </div>
                ))}
              </div>
            </header>

            {/* Activity list */}
            <div className="border-t border-white/10 pt-11">
              <h2 className="px-4 text-base font-semibold leading-7 text-white sm:px-6 lg:px-8">Alle Vorgänge</h2>
              <table className="mt-6 w-full whitespace-nowrap text-left">
                <colgroup>
                  <col className="w-full sm:w-4/12" />
                  <col className="lg:w-4/12" />
                  <col className="lg:w-2/12" />
                  <col className="lg:w-1/12" />
                  <col className="lg:w-1/12" />
                </colgroup>
                <thead className="border-b border-white/10 text-sm leading-6 text-white">
                  <tr>
                    <th scope="col" className="py-2 pl-4 pr-8 font-semibold sm:pl-6 lg:pl-8">
                    Aktenzeichen
                    </th>
                    <th scope="col" className="hidden py-2 pl-0 pr-8 font-semibold sm:table-cell">
                    Kennzeichen
                    </th>
                    <th scope="col" className="hidden py-2 pl-0 pr-8 font-semibold sm:table-cell">
                    Versicherung
                    </th>
                    <th scope="col" className="py-2 pl-0 pr-4 text-right font-semibold sm:pr-8 sm:text-left lg:pr-20">
                    Auftragsdatum
                    </th>
                    <th scope="col" className="hidden py-2 pl-0 pr-8 font-semibold md:table-cell lg:pr-20">
                    Schadennummer
                    </th>
                    <th scope="col" className="hidden py-2 pl-0 pr-8 font-semibold md:table-cell lg:pr-20">
                    Status
                    </th>
                    <th scope="col" className="hidden py-2 pl-0 pr-8 font-semibold md:table-cell lg:pr-20">
                    Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {process.map((item) => (
                    <tr key={item.commit}>
                      <td className="py-4 pl-4 pr-8 sm:pl-6 lg:pl-8">
                        <div className="flex items-center gap-x-4">
                          <div className="truncate text-sm font-medium leading-6 text-white">{ item.reference_fuchs }</div>
                        </div>
                      </td>
                      <td className="hidden py-4 pl-0 pr-4 sm:table-cell sm:pr-8">
                        <div className="flex gap-x-3">
                          <div className="font-mono text-sm leading-6 text-gray-400">{ item.license_plate }</div>
                        </div>
                      </td>
                      <td className="hidden py-4 pl-0 pr-4 sm:table-cell sm:pr-8">
                        <div className="flex gap-x-3">
                          <div className="font-mono text-sm leading-6 text-gray-400">{ item.insurance }</div>
                        </div>
                      </td>
                      <td className="hidden py-4 pl-0 pr-4 sm:table-cell sm:pr-8">
                        <div className="flex gap-x-3">
                          <div className="font-mono text-sm leading-6 text-gray-400">{ moment(item.order_date).format('DD.MM.YYYY') }</div>
                        </div>
                      </td>
                      <td className="hidden py-4 pl-0 pr-4 sm:table-cell sm:pr-8">
                        <div className="flex gap-x-3">
                          <div className="font-mono text-sm leading-6 text-gray-400">{item.reference_insurance}</div>
                        </div>
                      </td>
                      <td className="py-4 pl-0 pr-4 text-sm leading-6 sm:pr-8 lg:pr-20">
                        <div className="flex items-center justify-end gap-x-2 sm:justify-start">
                          <div className={classNames(statuses[item.execution_status], 'flex-none rounded-full p-1')}>
                            <div className="h-1.5 w-1.5 rounded-full bg-current" />
                          </div>
                          <div className="hidden text-white sm:block">{item.execution_status}</div>
                        </div>
                      </td>
                      <td>
                      <button
                        onClick={() => {
                          showDetail(item.id);
                        }}
                        type="button"
                        className="rounded-md bg-white/10 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-white/20"
                      >Anzeigen</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </main>
        </div>
      </div>
      <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={setOpen}>
        <div className="fixed inset-0" />

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-500 sm:duration-700"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500 sm:duration-700"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                  <div className="flex h-full flex-col overflow-y-scroll bg-white py-6 shadow-xl">
                    <div className="px-4 sm:px-6">
                      <div className="flex items-start justify-between">
                        <Dialog.Title className="text-base font-semibold leading-6 text-gray-900">
                          Neuen Auftrag anlegen
                        </Dialog.Title>
                        <div className="ml-3 flex h-7 items-center">
                          <button
                            type="button"
                            className="relative rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            onClick={() => setOpen(false)}
                          >
                            <span className="absolute -inset-2.5" />
                            <span className="sr-only">Close panel</span>
                            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                      <br /><br />

                      <div>
                      <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
                        Aktenzeichen
                      </label>
                      <div className="mt-2">
                        <input
                          ref={referencefuchsRef}
                          type="email"
                          name="email"
                          id="email"
                          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                          placeholder="S9Y01234"
                        />
                      </div>
                    </div>

                    <br/>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
                        Kennzeichen
                      </label>
                      <div className="mt-2">
                        <input
                          ref={licenseplateRef}
                          type="email"
                          name="email"
                          id="email"
                          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                          placeholder="GP-XY 123"
                        />
                      </div>
                    </div>

                    <br/>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
                        Versicherung
                      </label>
                      <div className="mt-2">
                        <input
                          ref={insuranceRef}
                          type="email"
                          name="email"
                          id="email"
                          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                          placeholder="Muserversicherung"
                        />
                      </div>
                    </div>

                    <br/>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
                        Schadennummer
                      </label>
                      <div className="mt-2">
                        <input
                          ref={referenceinsuranceRef}
                          type="email"
                          name="email"
                          id="email"
                          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                          placeholder="XYZ-123456789"
                        />
                      </div>
                    </div>

                    <br/>
                    <button
                      onClick={handleCreateProcess}
                      type="button"
                      className="inline-flex items-center gap-x-1.5 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >Anlegen</button>

                    </div>
                    <div className="relative mt-6 flex-1 px-4 sm:px-6">{/* Your content */}</div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>


    <Transition.Root show={openDetail} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={setOpenDetail}>
        <div className="fixed inset-0" />

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-500 sm:duration-700"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500 sm:duration-700"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                  <div className="flex h-full flex-col overflow-y-scroll bg-white py-6 shadow-xl px-5">
                    <div className="px-4 sm:px-6">
                      <div className="flex items-start justify-between">
                        <Dialog.Title className="text-base font-semibold leading-6 text-gray-900">
                          Auftrag { currentProcess.reference_fuchs }
                        </Dialog.Title>
                        <div className="ml-3 flex h-7 items-center">
                          <button
                            type="button"
                            className="relative rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            onClick={() => setOpenDetail(false)}
                          >
                            <span className="absolute -inset-2.5" />
                            <span className="sr-only">Close panel</span>
                            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                          </button>
                          
                        </div>
                      </div>
                      <br />

                      <button
                        onClick={() => setOpenModal(true)}
                        type="button"
                        className="rounded-md bg-gray-800 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-gray-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                      >
                        Flow starten
                      </button>

                      <button
                        type="button"
                        className="rounded-md bg-rose-600 px-2.5 ml-2 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-rose-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                      >
                        Löschen
                      </button>

                      <br/><br/>

                      <ul role="list" className="space-y-6">
        {activity.map((activityItem, activityItemIdx) => (
          <li key={activityItem.id} className="relative flex gap-x-4">
            <div
              className={classNames(
                activityItemIdx === activity.length - 1 ? 'h-6' : '-bottom-6',
                'absolute left-0 top-0 flex w-6 justify-center'
              )}
            >
              <div className="w-px bg-gray-200" />
            </div>
            {activityItem.type === 'ERROR' ? (
              <>
                <XCircleIcon className="h-6 w-6 text-rose-600 z-40" aria-hidden="true" />
                <div className="flex-auto rounded-md p-3 ring-1 ring-inset ring-gray-200">
                  <div className="flex justify-between gap-x-4">
                    <div className="py-0.5 text-xs leading-5 text-gray-500">
                      <span className="font-medium text-gray-900">Fehler</span> bei der Bearbeitung:
                    </div>
                    <time dateTime={activityItem.dateTime} className="flex-none py-0.5 text-xs leading-5 text-gray-500">
                      {activityItem.date}
                    </time>
                  </div>
                  <p className="text-sm leading-6 text-gray-500">{activityItem.message}</p>
                </div>
              </>
            ) : (
              <>
                <div className="relative flex h-6 w-6 flex-none items-center justify-center bg-white">
                  {activityItem.type === 'SUCCESS' ? (
                    <CheckCircleIcon className="h-6 w-6 text-green-600" aria-hidden="true" />
                  ) : (
                    <div className="h-1.5 w-1.5 rounded-full bg-gray-100 ring-1 ring-gray-300" />
                  )}
                </div>
                <p className="flex-auto py-0.5 text-xs leading-5 text-gray-500">
                  { activityItem.message }
                </p>
                <time dateTime={activityItem.dateTime} className="flex-none py-0.5 text-xs leading-5 text-gray-500">
                  {activityItem.date}
                </time>
              </>
            )}
          </li>
        ))}
      </ul>

                      <br/><br/>
                      <div>
      <div className="px-4 sm:px-0">
        <h3 className="text-base font-semibold leading-7 text-gray-900">{ currentProcess.reference_fuchs }</h3>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-500">Details zu dem Auftrag.</p>
      </div>
      <div className="mt-6 border-t border-gray-100">
        <dl className="divide-y divide-gray-100">
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt className="text-sm font-medium leading-6 text-gray-900">Aktenzeichen (Fuchs)</dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">{ currentProcess.reference_fuchs }</dd>
          </div>
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt className="text-sm font-medium leading-6 text-gray-900">Status</dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">{ currentProcess.execution_status }</dd>
          </div>
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt className="text-sm font-medium leading-6 text-gray-900">Aktenzeichen (Versicherung)</dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">{ currentProcess.reference_insurance }</dd>
          </div>
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt className="text-sm font-medium leading-6 text-gray-900">Kennzeichen</dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">{ currentProcess.license_plate }</dd>
          </div>
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt className="text-sm font-medium leading-6 text-gray-900">Versicherung</dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">{ currentProcess.insurance }</dd>
          </div>
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt className="text-sm font-medium leading-6 text-gray-900">VN</dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">{ currentProcess.prolicyholder }</dd>
          </div>
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt className="text-sm font-medium leading-6 text-gray-900">Auftragsdatum</dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">{ currentProcess.order_date }</dd>
          </div>
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt className="text-sm font-medium leading-6 text-gray-900">Abschlussdatum</dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">{ currentProcess.closing_date }</dd>
          </div>
          
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt className="text-sm font-medium leading-6 text-gray-900">Dateien</dt>
            <dd className="mt-2 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
              <ul role="list" className="divide-y divide-gray-100 rounded-md border border-gray-200">
                <li className="flex items-center justify-between py-4 pl-4 pr-5 text-sm leading-6">
                  <div className="flex w-0 flex-1 items-center">
                    
                    <div className="ml-4 flex min-w-0 flex-1 gap-2">
                      <span className="truncate font-medium">fahrzeugschein.png</span>
                      <span className="flex-shrink-0 text-gray-400">2.4mb</span>
                    </div>
                  </div>
                  <div className="ml-4 flex-shrink-0">
                    <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                      Download
                    </a>
                  </div>
                </li>
                <li className="flex items-center justify-between py-4 pl-4 pr-5 text-sm leading-6">
                  <div className="flex w-0 flex-1 items-center">
                    
                    <div className="ml-4 flex min-w-0 flex-1 gap-2">
                      <span className="truncate font-medium">gutachten.pdg</span>
                      <span className="flex-shrink-0 text-gray-400">4.5mb</span>
                    </div>
                  </div>
                  <div className="ml-4 flex-shrink-0">
                    <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                      Download
                    </a>
                  </div>
                </li>
              </ul>
            </dd>
          </div>
        </dl>
      </div>
    </div>

                    </div>
                    <div className="relative mt-6 flex-1 px-4 sm:px-6">{/* Your content */}</div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>

    <ToastContainer />
    <Transition.Root show={openModal} as={Fragment}>
      <Dialog as="div" className="relative z-50" initialFocus={cancelButtonRef} onClose={setOpen}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-60 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                    <FunnelIcon className="h-6 w-6 text-blue-600" aria-hidden="true" />
                  </div>
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                    <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-gray-900">
                      Starte einen Flow
                    </Dialog.Title>
                    <br/>
                    



                    <Listbox value={selectedFlow} onChange={setSelectedFlow}>
                    {({ open }) => (
                      <>
                        <Listbox.Label className="block text-sm font-medium leading-6 text-gray-900">RPA-Flow</Listbox.Label>
                        <div className="relative mt-2">
                          <Listbox.Button className="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6">
                            <span className="block truncate">{selectedFlow.name}</span>
                            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                              <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                            </span>
                          </Listbox.Button>

                          <Transition
                            show={open}
                            as={Fragment}
                            leave="transition ease-in duration-100"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                          >
                            <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                              {selectFlow.map((person) => (
                                <Listbox.Option
                                  key={person.id}
                                  className={({ active }) =>
                                    classNames(
                                      active ? 'bg-indigo-600 text-white' : 'text-gray-900',
                                      'relative cursor-default select-none py-2 pl-3 pr-9'
                                    )
                                  }
                                  value={person}
                                >
                                  {({ selectedFlow, active }) => (
                                    <>
                                      <span className={classNames(selectedFlow ? 'font-semibold' : 'font-normal', 'block truncate')}>
                                        {person.name}
                                      </span>

                                      {selectedFlow ? (
                                        <span
                                          className={classNames(
                                            active ? 'text-white' : 'text-indigo-600',
                                            'absolute inset-y-0 right-0 flex items-center pr-4'
                                          )}
                                        >
                                          <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                        </span>
                                      ) : null}
                                    </>
                                  )}
                                </Listbox.Option>
                              ))}
                            </Listbox.Options>
                          </Transition>
                        </div>
                      </>
                    )}
                  </Listbox>


                  <br />

                  <Listbox value={selectedOption} onChange={setSelectedOption}>
                    {({ open }) => (
                      <>
                        <Listbox.Label className="block text-sm font-medium leading-6 text-gray-900">Optionen</Listbox.Label>
                        <div className="relative mt-2">
                          <Listbox.Button className="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6">
                            <span className="block truncate">{selectedOption.name}</span>
                            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                              <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                            </span>
                          </Listbox.Button>

                          <Transition
                            show={open}
                            as={Fragment}
                            leave="transition ease-in duration-100"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                          >
                            <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                              {selectOption.map((person) => (
                                <Listbox.Option
                                  key={person.id}
                                  className={({ active }) =>
                                    classNames(
                                      active ? 'bg-indigo-600 text-white' : 'text-gray-900',
                                      'relative cursor-default select-none py-2 pl-3 pr-9'
                                    )
                                  }
                                  value={person}
                                >
                                  {({ selectedOption, active }) => (
                                    <>
                                      <span className={classNames(selectedOption ? 'font-semibold' : 'font-normal', 'block truncate')}>
                                        {person.name}
                                      </span>

                                      {selectedOption ? (
                                        <span
                                          className={classNames(
                                            active ? 'text-white' : 'text-indigo-600',
                                            'absolute inset-y-0 right-0 flex items-center pr-4'
                                          )}
                                        >
                                          <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                        </span>
                                      ) : null}
                                    </>
                                  )}
                                </Listbox.Option>
                              ))}
                            </Listbox.Options>
                          </Transition>
                        </div>
                      </>
                    )}
                  </Listbox>
                  <br />
                  </div>
                </div>
                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:ml-3 sm:w-auto"
                    onClick={() => {
                      setOpenModal(false);
                      startFlow();
                    }}
                  >
                    Start
                  </button>
                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                    onClick={() => setOpenModal(false)}
                    ref={cancelButtonRef}
                  >
                    Abbrechen
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
    </>
  )
}