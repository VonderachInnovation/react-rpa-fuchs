import React from 'react'
import ReactDOM from 'react-dom/client'
import Authentication from './Authentication.jsx'
import './index.css'
import {
  Routes,
  Route,
  Navigate,
  BrowserRouter
} from "react-router-dom";
import { supabase } from './supabaseClient.js';
import App from './App.jsx';


const Example = () => <p>Example Komponente</p>;
const Loggedin = () => (<div>
  <div>Logged in!</div>
  <button onClick={() => supabase.auth.signOut()}>Sign out</button>
</div>)

const Routing = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Example />}></Route>
        <Route path="/app" element={<Example />}></Route>
        <Route path="/test" element={	<Navigate to="/app" />}></Route>
        <Route path='/dashboard' element={ <Authentication><App /></Authentication>} />
      </Routes>
    </BrowserRouter>
  );
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Routing />
  </React.StrictMode>,
)
