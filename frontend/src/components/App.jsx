import Home from './Home';
import Login from './Login';
import Register from './Register';
import Admin from './Admin';

import {BrowserRouter, Routes, Route} from "react-router-dom";

function App() {

  return (
    <div>
      <BrowserRouter >
        <Routes>
          <Route path="/" element ={<Home/>} />
          <Route path="/register" element ={<Register/>} />
          <Route path="/login" element ={<Login/>} />
          <Route path="/home" element ={<Home/>} />
          <Route path="/admin" element ={<Admin/>} />
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
