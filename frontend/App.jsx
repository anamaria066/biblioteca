import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Login from './Login';
import Welcome from './Welcome';
import SignUp from './SignUp';
import MainPageClient from './MainPageClient';
import MainPageAdmin from './MainPageAdmin';
import DetaliiCarte from './DetaliiCarte';
import Favorite from './Favorite';
import ProfilAdmin from './ProfilAdmin';
import ProfilClient from './ProfilClient';
import CartiAdmin from './CartiAdmin';
import Utilizatori from './Utilizatori';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path='/signup' element={<SignUp/>}/>
        <Route path='/client' element={<MainPageClient/>}/>
        <Route path='/admin' element={<MainPageAdmin/>}/>
        <Route path='/detalii/:id' element={<DetaliiCarte/>}/>
        <Route path='/favorite' element={<Favorite/>}/>
        <Route path='/profil-admin' element={<ProfilAdmin/>}/>
        <Route path='/profil-client' element={<ProfilClient/>}/>
        <Route path='/carti' element={<CartiAdmin/>}/>
        <Route path='/utilizatori' element={<Utilizatori/>}/>
      </Routes>
    </BrowserRouter>
  );
};

export default App;