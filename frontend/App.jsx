import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Login from './Login';
import Welcome from './Welcome';
import SignUp from './SignUp';
import MainPageClient from './MainPageClient';
import MainPageAdmin from './MainPageAdmin';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path='/signup' element={<SignUp/>}/>
        <Route path='/client' element={<MainPageClient/>}/>
        <Route path='/admin' element={<MainPageAdmin/>}/>
      </Routes>
    </BrowserRouter>
  );
};

export default App;